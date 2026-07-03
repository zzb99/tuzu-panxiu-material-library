const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('../backend/node_modules/mysql2/promise');

const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, '土族盘绣纹样命名', '纹样');
const uploadRoot = path.join(root, 'uploads', 'pattern-naming-library');

function readEnv() {
  const values = {};
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (match) values[match[1]] = match[2];
  }
  return values;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function cleanTitle(file, category) {
  const base = path.basename(file, path.extname(file)).trim();
  const page = base.match(/^第(\d+)页-(\d+)/);
  const named = base.replace(/^第\d+页-\d+\s*/, '').trim();
  if (named) return named;
  return page ? `${category}（第${page[1]}页-${page[2]}）` : base;
}

async function main() {
  if (!fs.existsSync(sourceRoot)) throw new Error(`找不到源目录：${sourceRoot}`);
  const env = readEnv();
  const db = await mysql.createConnection({
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT || 3306),
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    charset: 'utf8mb4',
  });
  const files = walk(sourceRoot).filter((file) => /\.png$/i.test(file));
  fs.mkdirSync(uploadRoot, { recursive: true });
  let created = 0;
  let skipped = 0;

  try {
    await db.beginTransaction();
    const categoryNames = [...new Set(files.map((file) => path.basename(path.dirname(file))))].sort();
    const categoryIds = new Map();
    for (const [index, name] of categoryNames.entries()) {
      const [existing] = await db.execute(
        "SELECT id FROM category WHERE resource_type='pattern' AND name=? ORDER BY id LIMIT 1",
        [name],
      );
      let id = existing[0]?.id;
      if (!id) {
        const slugHash = crypto.createHash('sha1').update(name).digest('hex').slice(0, 12);
        const [result] = await db.execute(
          "INSERT INTO category (resource_type,name,slug,description,sort_order,status) VALUES ('pattern',?,?,?,?,'published')",
          [name, `naming-library-${slugHash}`, `来自“土族盘绣纹样命名”资料库的纹样分类。`, 100 - index],
        );
        id = result.insertId;
      }
      categoryIds.set(name, id);
    }

    for (const file of files) {
      const bytes = fs.readFileSync(file);
      const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
      const storedName = `${sha256}.png`;
      const target = path.join(uploadRoot, storedName);
      const fileUrl = `/uploads/pattern-naming-library/${storedName}`;
      const originalName = path.basename(file);
      const category = path.basename(path.dirname(file));
      const relativeSource = path.relative(path.join(root, '土族盘绣纹样命名'), file).split(path.sep).join('/');
      const content = `原始资料路径：${relativeSource}。文化寓意、年代、来源地与版权信息待后续核校补充。`;
      if (!fs.existsSync(target)) fs.copyFileSync(file, target);

      await db.execute(
        "INSERT INTO media_file (original_name,file_name,file_url,mime_type,file_type,file_size,sha256) VALUES (?, ?, ?, 'image/png', 'image', ?, ?) ON DUPLICATE KEY UPDATE original_name=VALUES(original_name),file_size=VALUES(file_size),sha256=VALUES(sha256)",
        [originalName, storedName, fileUrl, bytes.length, sha256],
      );
      const [existingPattern] = await db.execute('SELECT id FROM pattern WHERE content=? LIMIT 1', [content]);
      let patternId = existingPattern[0]?.id;
      if (!patternId) {
        const title = cleanTitle(file, category);
        const description = `来自“土族盘绣纹样命名”的${category}类纹样图片。`;
        const [result] = await db.execute(
          "INSERT INTO pattern (title,cover_image,category_id,craft_type,description,content,tags,status,sort_order,is_featured,published_at) VALUES (?,?,?,'土族盘绣',?,?,?,'published',0,0,NOW())",
          [title, fileUrl, categoryIds.get(category), description, content, JSON.stringify([category, '土族盘绣', '纹样命名库'])],
        );
        patternId = result.insertId;
        created += 1;
      } else {
        skipped += 1;
      }
      await db.execute(
        'INSERT INTO pattern_image (pattern_id,image_url,alt_text,sort_order) SELECT ?,?,?,10 WHERE NOT EXISTS (SELECT 1 FROM pattern_image WHERE pattern_id=? AND image_url=?)',
        [patternId, fileUrl, cleanTitle(file, category), patternId, fileUrl],
      );
      await db.execute(
        "INSERT IGNORE INTO download_file (resource_type,resource_id,file_name,file_url,file_type,file_size) VALUES ('pattern',?,?,?,?,?)",
        [patternId, originalName, fileUrl, 'image/png', bytes.length],
      );
    }
    await db.execute(
      "DELETE duplicate FROM pattern_image duplicate JOIN pattern_image keeper ON keeper.pattern_id=duplicate.pattern_id AND keeper.image_url=duplicate.image_url AND keeper.id<duplicate.id WHERE duplicate.image_url LIKE '/uploads/pattern-naming-library/%'",
    );
    await db.commit();
    console.log(JSON.stringify({ total: files.length, created, skipped, categories: categoryIds.size, uploadRoot }, null, 2));
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
