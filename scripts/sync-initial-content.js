const fs = require('node:fs')
const path = require('node:path')
const mysql = require('../backend/node_modules/mysql2/promise')

const root = path.resolve(__dirname, '..')
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)] }),
)
const targetDb = env.DATABASE_NAME || 'tuzu_panxiu'
const tempDb = `${targetDb}_seed_sync`
const connectionOptions = {
  host: env.DATABASE_HOST || 'localhost', port: Number(env.DATABASE_PORT || 3306),
  user: env.DATABASE_USER || 'root', password: env.DATABASE_PASSWORD || '', multipleStatements: true,
}

async function rows(conn, db, table) {
  const [result] = await conn.query(`SELECT * FROM \`${db}\`.\`${table}\``)
  return result
}

async function main() {
  const conn = await mysql.createConnection(connectionOptions)
  const schema = fs.readFileSync(path.join(root, 'database/schema.sql'), 'utf8')
    .replaceAll('`tuzu_panxiu`', `\`${tempDb}\``)
  const seed = fs.readFileSync(path.join(root, 'database/seed.sql'), 'utf8')
    .replaceAll('`tuzu_panxiu`', `\`${tempDb}\``)
  await conn.query(`DROP DATABASE IF EXISTS \`${tempDb}\``)
  await conn.query(schema)
  await conn.query(seed)
  await conn.query(`USE \`${targetDb}\``)
  await conn.beginTransaction()
  try {
    for (const r of await rows(conn, tempDb, 'site_setting')) {
      await conn.query('INSERT INTO site_setting (setting_key,setting_value,description) VALUES (?,?,?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value),description=VALUES(description)', [r.setting_key, JSON.stringify(r.setting_value), r.description])
    }
    for (const r of await rows(conn, tempDb, 'tag')) {
      await conn.query('INSERT INTO tag (name,slug,description,status,sort_order) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description),status=VALUES(status),sort_order=VALUES(sort_order)', [r.name,r.slug,r.description,r.status,r.sort_order])
    }
    const categoryMap = new Map()
    const sourceCategories = await rows(conn, tempDb, 'category')
    for (const r of sourceCategories.filter(x => !x.parent_id)) {
      await conn.query('INSERT INTO category (resource_type,name,slug,description,sort_order,status) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description),sort_order=VALUES(sort_order),status=VALUES(status)', [r.resource_type,r.name,r.slug,r.description,r.sort_order,r.status])
    }
    for (const r of sourceCategories.filter(x => x.parent_id)) {
      const parent = sourceCategories.find(x => x.id === r.parent_id)
      const [[p]] = await conn.query('SELECT id FROM category WHERE resource_type=? AND slug=?', [parent.resource_type,parent.slug])
      await conn.query('INSERT INTO category (resource_type,parent_id,name,slug,description,sort_order,status) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE parent_id=VALUES(parent_id),name=VALUES(name),description=VALUES(description),sort_order=VALUES(sort_order),status=VALUES(status)', [r.resource_type,p.id,r.name,r.slug,r.description,r.sort_order,r.status])
    }
    for (const r of sourceCategories) {
      const [[live]] = await conn.query('SELECT id FROM category WHERE resource_type=? AND slug=?', [r.resource_type,r.slug])
      categoryMap.set(r.id, live.id)
    }
    for (const r of await rows(conn, tempDb, 'banner')) {
      const [found] = await conn.query('SELECT id FROM banner WHERE title=? LIMIT 1', [r.title])
      const values = [r.subtitle,r.image_url,r.link_url,r.link_text,r.status,r.sort_order,r.start_at,r.end_at]
      if (found.length) await conn.query('UPDATE banner SET subtitle=?,image_url=?,link_url=?,link_text=?,status=?,sort_order=?,start_at=?,end_at=? WHERE id=?', [...values,found[0].id])
      else await conn.query('INSERT INTO banner (title,subtitle,image_url,link_url,link_text,status,sort_order,start_at,end_at) VALUES (?,?,?,?,?,?,?,?,?)', [r.title,...values])
    }
    for (const r of await rows(conn, tempDb, 'page_content')) {
      await conn.query('INSERT INTO page_content (page_key,title,cover_image,description,content,tags,status,sort_order,is_featured,published_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title),cover_image=VALUES(cover_image),description=VALUES(description),content=VALUES(content),tags=VALUES(tags),status=VALUES(status),sort_order=VALUES(sort_order),is_featured=VALUES(is_featured),published_at=VALUES(published_at)', [r.page_key,r.title,r.cover_image,r.description,r.content,JSON.stringify(r.tags),r.status,r.sort_order,r.is_featured,r.published_at])
    }
    const definitions = {
      pattern: ['cover_image','category_id','source_area','application_part','craft_type','main_colors','meaning','description','content','tags','status','sort_order','is_featured','published_at'],
      document: ['cover_image','category_id','author','source','year','summary','description','content','tags','status','sort_order','is_featured','published_at'],
      creation: ['cover_image','category_id','creator_name','creation_date','description','content','tags','status','sort_order','is_featured','published_at'],
      inheritor: ['cover_image','category_id','level','region','birth_year','description','content','tags','status','sort_order','is_featured','published_at'],
      application_case: ['cover_image','category_id','case_type','client_name','case_date','description','content','tags','status','sort_order','is_featured','published_at'],
    }
    const resourceMaps = {}
    for (const [table, fields] of Object.entries(definitions)) {
      resourceMaps[table] = new Map()
      for (const r of await rows(conn, tempDb, table)) {
        const record = {...r, category_id: categoryMap.get(r.category_id) || null}
        for (const key of ['main_colors','tags']) if (record[key] != null) record[key] = JSON.stringify(record[key])
        const [found] = await conn.query(`SELECT id FROM \`${table}\` WHERE title=? LIMIT 1`, [r.title])
        const values = fields.map(key => record[key])
        let id
        if (found.length) { id=found[0].id; await conn.query(`UPDATE \`${table}\` SET ${fields.map(k=>`\`${k}\`=?`).join(',')} WHERE id=?`, [...values,id]) }
        else { const [result]=await conn.query(`INSERT INTO \`${table}\` (title,${fields.map(k=>`\`${k}\``).join(',')}) VALUES (${Array(fields.length+1).fill('?').join(',')})`, [r.title,...values]); id=result.insertId }
        resourceMaps[table].set(r.id,id)
      }
    }
    for (const r of await rows(conn, tempDb, 'pattern_image')) {
      const patternId=resourceMaps.pattern.get(r.pattern_id)
      const [found]=await conn.query('SELECT id FROM pattern_image WHERE pattern_id=? AND image_url=?',[patternId,r.image_url])
      if (!found.length) await conn.query('INSERT INTO pattern_image (pattern_id,image_url,alt_text,sort_order) VALUES (?,?,?,?)',[patternId,r.image_url,r.alt_text,r.sort_order])
    }
    for (const r of await rows(conn, tempDb, 'media_file')) {
      await conn.query('INSERT INTO media_file (original_name,file_name,file_url,mime_type,file_type,file_size,width,height,sha256) VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE original_name=VALUES(original_name),file_name=VALUES(file_name),mime_type=VALUES(mime_type),file_type=VALUES(file_type),file_size=VALUES(file_size)', [r.original_name,r.file_name,r.file_url,r.mime_type,r.file_type,r.file_size,r.width,r.height,r.sha256])
    }
    for (const r of await rows(conn, tempDb, 'download_file')) {
      const resourceId=resourceMaps[r.resource_type].get(r.resource_id)
      await conn.query('INSERT INTO download_file (resource_type,resource_id,file_name,file_url,file_type,file_size,download_count) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE file_name=VALUES(file_name),file_type=VALUES(file_type),file_size=VALUES(file_size)', [r.resource_type,resourceId,r.file_name,r.file_url,r.file_type,r.file_size,r.download_count])
    }
    await conn.commit()
    await conn.query(`DROP DATABASE \`${tempDb}\``)
    for (const table of ['banner','pattern','document','creation','inheritor','application_case','page_content','download_file']) {
      const [[r]]=await conn.query(`SELECT COUNT(*) AS count FROM \`${table}\``); console.log(`${table}: ${r.count}`)
    }
  } catch (error) {
    await conn.rollback()
    await conn.query(`DROP DATABASE IF EXISTS \`${tempDb}\``)
    throw error
  } finally { await conn.end() }
}

main().catch(error => { console.error(error); process.exit(1) })
