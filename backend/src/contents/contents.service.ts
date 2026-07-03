import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContentSort, ContentStatus } from '../common/dto/query.dto';
import { sanitizeRichText } from '../common/sanitize';
import { AdminContentQueryDto, ContentBodyDto, PatternImageDto, PublicContentQueryDto, ResourceType } from './dto/content-query.dto';

const common = ['title','cover_image','description','content','tags','status','sort_order','is_featured'];
const fields: Record<ResourceType, string[]> = {
  pattern: [...common,'category_id','source_area','application_part','craft_type','main_colors','meaning'],
  document: [...common,'category_id','author','source','year','summary'],
  creation: [...common,'category_id','creator_name','creation_date'],
  inheritor: [...common,'category_id','level','region','birth_year'],
  application_case: [...common,'category_id','case_type','client_name','case_date'],
};
const jsonFields = new Set(['tags','main_colors','steps']);
const categoryTables = new Set<ResourceType>(Object.values(ResourceType));
const orderSql: Record<ContentSort, string> = {
  default: 'sort_order DESC, published_at DESC, id DESC', latest: 'published_at DESC, id DESC',
  popular: 'view_count DESC, id DESC', downloads: 'download_count DESC, id DESC',
};
const camelToSnake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

@Injectable()
export class ContentsService {
  constructor(private readonly db: DataSource) {}
  listPublic(query: PublicContentQueryDto) { return this.list(query, true); }
  listAdmin(query: AdminContentQueryDto) { return this.list(query, false); }

  async detail(type: ResourceType, id: string, isPublic: boolean) {
    const rows = await this.db.query(`SELECT * FROM \`${type}\` WHERE id = ?${isPublic ? " AND status = 'published'" : ''} LIMIT 1`, [id]);
    if (!rows[0]) throw new NotFoundException('内容不存在');
    const item = rows[0];
    if (isPublic) {
      await this.db.query(`UPDATE \`${type}\` SET view_count = view_count + 1 WHERE id = ?`, [id]);
      item.view_count = String(Number(item.view_count || 0) + 1);
    }
    if (type === ResourceType.PATTERN) item.images = await this.db.query('SELECT * FROM pattern_image WHERE pattern_id = ? ORDER BY sort_order DESC, id ASC', [id]);
    item.downloadFiles = await this.db.query('SELECT id, resource_type, resource_id, file_name, file_url, file_type, file_size, download_count, created_at, updated_at FROM download_file WHERE resource_type = ? AND resource_id = ? ORDER BY id ASC', [type, id]);
    return item;
  }

  async create(type: ResourceType, dto: ContentBodyDto) {
    const data = this.toData(type, dto);
    if (data.status === 'published') data.published_at = new Date();
    const keys = Object.keys(data); const result = await this.db.query(`INSERT INTO \`${type}\` (${keys.map(k=>`\`${k}\``).join(',')}) VALUES (${keys.map(()=>'?').join(',')})`, Object.values(data));
    return this.detail(type, String(result.insertId), false);
  }

  async update(type: ResourceType, id: string, dto: ContentBodyDto) {
    await this.ensure(type, id); const data = this.toData(type, dto);
    if (data.status === 'published') data.published_at = new Date();
    const keys = Object.keys(data); if (keys.length) await this.db.query(`UPDATE \`${type}\` SET ${keys.map(k=>`\`${k}\` = ?`).join(',')} WHERE id = ?`, [...Object.values(data), id]);
    return this.detail(type, id, false);
  }

  async remove(type: ResourceType, id: string) {
    await this.ensure(type,id);
    await this.db.transaction(async manager => {
      await manager.query('DELETE FROM download_file WHERE resource_type = ? AND resource_id = ?', [type, id]);
      await manager.query(`DELETE FROM \`${type}\` WHERE id = ?`, [id]);
    });
    return { id };
  }
  async setStatus(type: ResourceType,id:string,status:ContentStatus) { await this.ensure(type,id); await this.db.query(`UPDATE \`${type}\` SET status = ?, published_at = IF(? = 'published', COALESCE(published_at,NOW()), published_at) WHERE id = ?`,[status,status,id]); return this.detail(type,id,false); }
  async setSort(type: ResourceType,id:string,sortOrder:number) { await this.ensure(type,id); await this.db.query(`UPDATE \`${type}\` SET sort_order = ? WHERE id = ?`,[sortOrder,id]); return this.detail(type,id,false); }
  async setFeatured(type: ResourceType,id:string,value:boolean) { await this.ensure(type,id); await this.db.query(`UPDATE \`${type}\` SET is_featured = ? WHERE id = ?`,[value?1:0,id]); return this.detail(type,id,false); }

  async featured(type?: ResourceType, limit=8) {
    const types = type ? [type] : Object.values(ResourceType); const result: Record<string,unknown[]> = {};
    for (const itemType of types) result[itemType] = await this.db.query(`SELECT * FROM \`${itemType}\` WHERE status='published' AND is_featured=1 ORDER BY sort_order DESC,published_at DESC,id DESC LIMIT ?`,[Math.min(Math.max(limit,1),50)]);
    return type ? result[type] : result;
  }

  async addPatternImage(patternId:string,dto:PatternImageDto) { await this.ensure(ResourceType.PATTERN,patternId); const r=await this.db.query('INSERT INTO pattern_image (pattern_id,image_url,alt_text,sort_order) VALUES (?,?,?,?)',[patternId,dto.imageUrl,dto.altText??null,dto.sortOrder]); return (await this.db.query('SELECT * FROM pattern_image WHERE id=?',[r.insertId]))[0]; }
  async updatePatternImage(id:string,dto:PatternImageDto) { const found=await this.db.query('SELECT id FROM pattern_image WHERE id=?',[id]); if(!found[0]) throw new NotFoundException('纹样图片不存在'); await this.db.query('UPDATE pattern_image SET image_url=?,alt_text=?,sort_order=? WHERE id=?',[dto.imageUrl,dto.altText??null,dto.sortOrder,id]); return (await this.db.query('SELECT * FROM pattern_image WHERE id=?',[id]))[0]; }
  async removePatternImage(id:string) { const r=await this.db.query('DELETE FROM pattern_image WHERE id=?',[id]); if(!r.affectedRows) throw new NotFoundException('纹样图片不存在'); return {id}; }

  private async ensure(type:ResourceType,id:string) { const rows=await this.db.query(`SELECT id FROM \`${type}\` WHERE id=?`,[id]); if(!rows[0]) throw new NotFoundException('内容不存在'); }
  private toData(type:ResourceType,dto:ContentBodyDto) { const out:Record<string,unknown>={}; for(const [key,value] of Object.entries(dto)){ if(value===undefined) continue; const column=camelToSnake(key); if(!fields[type].includes(column)) throw new BadRequestException(`字段 ${key} 不适用于 ${type}`); out[column]=jsonFields.has(column)?JSON.stringify(value):column==='content'?sanitizeRichText(value as string|null):value; } return out; }

  private async list(query:PublicContentQueryDto|AdminContentQueryDto,isPublic:boolean) {
    const table=query.type, where:string[]=[], params:unknown[]=[];
    if(isPublic){where.push("status = 'published'");} else if('status' in query&&query.status){where.push('status=?');params.push(query.status);}
    if(query.keyword?.trim()){where.push('(title LIKE ? OR description LIKE ?)');const k=`%${query.keyword.trim()}%`;params.push(k,k);}
    if(query.categoryId){if(!categoryTables.has(table)) throw new BadRequestException('该内容类型不支持分类筛选');where.push('category_id=?');params.push(query.categoryId);}
    for(const tag of query.tags??[]){where.push('JSON_CONTAINS(tags,JSON_QUOTE(?))');params.push(tag);}
    if(table===ResourceType.PATTERN){for(const c of query.colors??[]){where.push('JSON_CONTAINS(main_colors,JSON_QUOTE(?))');params.push(c);} this.addIn(where,params,'craft_type',query.crafts);this.addIn(where,params,'application_part',query.parts);for(const m of query.meanings??[]){where.push('meaning LIKE ?');params.push(`%${m}%`);}}
    else if(query.colors?.length||query.crafts?.length||query.parts?.length||query.meanings?.length) throw new BadRequestException('扩展筛选仅适用于纹样');
    const clause=where.length?` WHERE ${where.join(' AND ')}`:''; const offset=(query.page-1)*query.pageSize;
    const [items,counts]=await Promise.all([this.db.query(`SELECT * FROM \`${table}\`${clause} ORDER BY ${orderSql[query.sort]} LIMIT ? OFFSET ?`,[...params,query.pageSize,offset]),this.db.query(`SELECT COUNT(*) total FROM \`${table}\`${clause}`,params)]);
    const total=Number(counts[0].total);return {items,page:query.page,pageSize:query.pageSize,total,totalPages:Math.ceil(total/query.pageSize)};
  }
  private addIn(where:string[],params:unknown[],column:string,values?:string[]){if(values?.length){where.push(`${column} IN (${values.map(()=>'?').join(',')})`);params.push(...values);}}
}
