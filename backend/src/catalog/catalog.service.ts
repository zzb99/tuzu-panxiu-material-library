import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BannerDto, CatalogQueryDto, CategoryDto, PageContentDto, TagDto } from './catalog.dto';
import { SiteSettingsDto } from './catalog.dto';
import { sanitizeRichText } from '../common/sanitize';

type Kind='category'|'tag'|'banner'|'page_content';
const columns:Record<Kind,string[]>={
  category:['resource_type','parent_id','name','slug','description','sort_order','status'],
  tag:['name','slug','description','sort_order','status'],
  banner:['title','subtitle','image_url','link_url','link_text','status','sort_order','start_at','end_at'],
  page_content:['page_key','title','cover_image','description','content','tags','status','sort_order','is_featured'],
};
const camel=(s:string)=>s.replace(/[A-Z]/g,c=>`_${c.toLowerCase()}`);
@Injectable()
export class CatalogService {
  constructor(private readonly db:DataSource){}
  async list(kind:Kind,q:CatalogQueryDto,isPublic:boolean){const where:string[]=[],p:unknown[]=[];if(isPublic)where.push("status='published'");else if(q.status){where.push('status=?');p.push(q.status);}if(q.keyword){const col=kind==='category'||kind==='tag'?'name':'title';where.push(`${col} LIKE ?`);p.push(`%${q.keyword}%`);}if(kind==='category'&&q.resourceType){where.push('resource_type=?');p.push(q.resourceType);}if(kind==='banner'&&isPublic)where.push('(start_at IS NULL OR start_at<=NOW()) AND (end_at IS NULL OR end_at>=NOW())');const w=where.length?` WHERE ${where.join(' AND ')}`:'';const offset=(q.page-1)*q.pageSize;const [items,c]=await Promise.all([this.db.query(`SELECT * FROM \`${kind}\`${w} ORDER BY sort_order DESC,id DESC LIMIT ? OFFSET ?`,[...p,q.pageSize,offset]),this.db.query(`SELECT COUNT(*) total FROM \`${kind}\`${w}`,p)]);const total=Number(c[0].total);return{items,page:q.page,pageSize:q.pageSize,total,totalPages:Math.ceil(total/q.pageSize)};}
  async detail(kind:Kind,id:string,isPublic:boolean){const r=await this.db.query(`SELECT * FROM \`${kind}\` WHERE id=?${isPublic?" AND status='published'":''}`,[id]);if(!r[0])throw new NotFoundException('记录不存在');return r[0];}
  async pageByKey(key:string){const r=await this.db.query("SELECT * FROM page_content WHERE page_key=? AND status='published'",[key]);if(!r[0])throw new NotFoundException('页面内容不存在');return r[0];}
  async getSettings(){const rows=await this.db.query('SELECT setting_key,setting_value FROM site_setting WHERE setting_key IN (?,?,?,?,?)',['site_name','site_subtitle','contact','copyright','icp']);return Object.fromEntries(rows.map((row:{setting_key:string;setting_value:unknown})=>[row.setting_key,row.setting_value]));}
  async updateSettings(dto:SiteSettingsDto){const values:Record<string,string|null>={site_name:dto.siteName,site_subtitle:dto.siteSubtitle,contact:dto.contact??null,copyright:dto.copyright??null,icp:dto.icp??null};await this.db.transaction(async manager=>{for(const[key,value]of Object.entries(values))await manager.query('INSERT INTO site_setting (setting_key,setting_value,description) VALUES (?,CAST(? AS JSON),?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)',[key,JSON.stringify(value),key]);});return this.getSettings();}
  async create(kind:Kind,dto:CategoryDto|TagDto|BannerDto|PageContentDto){const d=this.data(kind,dto);if(d.status==='published'&&kind==='page_content')d.published_at=new Date();const k=Object.keys(d),r=await this.db.query(`INSERT INTO \`${kind}\` (${k.map(x=>`\`${x}\``).join(',')}) VALUES (${k.map(()=>'?').join(',')})`,Object.values(d));return this.detail(kind,String(r.insertId),false);}
  async update(kind:Kind,id:string,dto:CategoryDto|TagDto|BannerDto|PageContentDto){await this.detail(kind,id,false);const d=this.data(kind,dto);if(d.status==='published'&&kind==='page_content')d.published_at=new Date();const k=Object.keys(d);await this.db.query(`UPDATE \`${kind}\` SET ${k.map(x=>`\`${x}\`=?`).join(',')} WHERE id=?`,[...Object.values(d),id]);return this.detail(kind,id,false);}
  async remove(kind:Kind,id:string){await this.detail(kind,id,false);await this.db.query(`DELETE FROM \`${kind}\` WHERE id=?`,[id]);return{id};}
  private data(kind:Kind,dto:object){const d:Record<string,unknown>={};for(const[k,v]of Object.entries(dto)){if(v===undefined)continue;const col=camel(k);if(columns[kind].includes(col))d[col]=col==='tags'?JSON.stringify(v):col==='content'?sanitizeRichText(v as string|null):v;}return d;}
}
