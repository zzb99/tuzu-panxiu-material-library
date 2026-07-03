import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, promises as fs } from 'node:fs';
import { basename, extname, relative, resolve, sep } from 'node:path';
import { DataSource } from 'typeorm';
import { resolveUploadDir } from '../config/paths';
import { ResourceType } from '../contents/dto/content-query.dto';
import { DownloadFileDto } from './files.dto';

@Injectable()
export class FilesService{
 private readonly root:string;
 constructor(private readonly db:DataSource,config:ConfigService){this.root=resolveUploadDir(config.getOrThrow<string>('UPLOAD_DIR'));}
 async validateAndRecord(file:Express.Multer.File){try{const data=await fs.readFile(file.path);if(!this.validSignature(extname(file.originalname).toLowerCase(),data))throw new BadRequestException('文件内容与扩展名不匹配或包含不安全内容');const sha=createHash('sha256').update(data).digest('hex');const url=`/uploads/${relative(this.root,file.path).split(sep).join('/')}`;const type=this.type(extname(file.originalname).toLowerCase());const r=await this.db.query('INSERT INTO media_file (original_name,file_name,file_url,mime_type,file_type,file_size,sha256) VALUES (?,?,?,?,?,?,?)',[file.originalname,file.filename,url,file.mimetype,type,file.size,sha]);return(await this.db.query('SELECT id,original_name,file_name,file_url,mime_type,file_type,file_size,width,height,sha256,created_at FROM media_file WHERE id=?',[r.insertId]))[0];}catch(error){await fs.unlink(file.path).catch(()=>undefined);throw error;}}
 async listMedia(page:number,pageSize:number,type?:string){const p=Math.max(page,1),s=Math.min(Math.max(pageSize,1),100),where=type?' WHERE file_type=?':'',args=type?[type]:[];const[items,c]=await Promise.all([this.db.query(`SELECT * FROM media_file${where} ORDER BY id DESC LIMIT ? OFFSET ?`,[...args,s,(p-1)*s]),this.db.query(`SELECT COUNT(*) total FROM media_file${where}`,args)]);const total=Number(c[0].total);return{items,page:p,pageSize:s,total,totalPages:Math.ceil(total/s)};}
 async removeMedia(id:string){const item=await this.media(id);const checks=[['download_file','file_url'],['pattern_image','image_url'],['banner','image_url'],['page_content','cover_image'],...Object.values(ResourceType).map(table=>[table,'cover_image'])] as string[][];for(const[table,column]of checks){const rows=await this.db.query(`SELECT id FROM \`${table}\` WHERE \`${column}\`=? LIMIT 1`,[item.file_url]);if(rows[0])throw new BadRequestException('文件仍被内容引用，不能删除');}const disk=this.safePath(item.file_url);await this.db.query('DELETE FROM media_file WHERE id=?',[id]);if(existsSync(disk))await fs.unlink(disk);return{id};}
 async addDownload(dto:DownloadFileDto){await this.ensureResource(dto.resourceType,String(dto.resourceId));const media=await this.media(String(dto.mediaFileId));const r=await this.db.query('INSERT INTO download_file (resource_type,resource_id,file_name,file_url,file_type,file_size) VALUES (?,?,?,?,?,?)',[dto.resourceType,dto.resourceId,dto.fileName,media.file_url,media.mime_type,media.file_size]);return this.download(String(r.insertId),false);}
 async replaceDownload(id:string,dto:DownloadFileDto){await this.download(id,false);await this.ensureResource(dto.resourceType,String(dto.resourceId));const media=await this.media(String(dto.mediaFileId));await this.db.query('UPDATE download_file SET resource_type=?,resource_id=?,file_name=?,file_url=?,file_type=?,file_size=? WHERE id=?',[dto.resourceType,dto.resourceId,dto.fileName,media.file_url,media.mime_type,media.file_size,id]);return this.download(id,false);}
 async listDownloads(type:ResourceType,id:string,isPublic:boolean){if(isPublic)await this.ensureResource(type,id,true);else await this.ensureResource(type,id);return this.db.query('SELECT id,resource_type,resource_id,file_name,file_url,file_type,file_size,download_count,created_at,updated_at FROM download_file WHERE resource_type=? AND resource_id=? ORDER BY id',[type,id]);}
 async removeDownload(id:string){await this.download(id,false);await this.db.query('DELETE FROM download_file WHERE id=?',[id]);return{id};}
 async download(id:string,isPublic=true){const rows=await this.db.query('SELECT * FROM download_file WHERE id=?',[id]),item=rows[0];if(!item)throw new NotFoundException('下载文件不存在');await this.ensureResource(item.resource_type,String(item.resource_id),isPublic);return item;}
 async stream(id:string){const item=await this.download(id,true);const disk=this.safePath(item.file_url);if(!existsSync(disk))throw new NotFoundException('文件不存在');await this.db.transaction(async m=>{await m.query('UPDATE download_file SET download_count=download_count+1 WHERE id=?',[id]);await m.query(`UPDATE \`${item.resource_type}\` SET download_count=download_count+1 WHERE id=?`,[item.resource_id]);});return{stream:createReadStream(disk),name:basename(item.file_name),mime:item.file_type,size:Number(item.file_size)};}
 private safePath(url:string){const prefix='/uploads/';if(!url.startsWith(prefix))throw new BadRequestException('文件路径无效');const path=resolve(this.root,url.slice(prefix.length));if(path!==this.root&&!path.startsWith(this.root+sep))throw new BadRequestException('文件路径无效');return path;}
 private async media(id:string){const r=await this.db.query('SELECT * FROM media_file WHERE id=?',[id]);if(!r[0])throw new NotFoundException('媒体文件不存在');return r[0];}
 private async ensureResource(type:ResourceType,id:string,published=false){const r=await this.db.query(`SELECT id FROM \`${type}\` WHERE id=?${published?" AND status='published'":''}`,[id]);if(!r[0])throw new NotFoundException('关联资源不存在或不可用');}
 private type(ext:string){if(['.jpg','.jpeg','.png','.webp','.svg'].includes(ext))return'image';if(ext==='.pdf')return'pdf';if(['.doc','.docx'].includes(ext))return'word';if(ext==='.zip')return'zip';if(ext==='.mp4')return'video';return'other';}
 private validSignature(ext:string,data:Buffer){
  const hex=data.subarray(0,12).toString('hex');
  if(ext==='.jpg'||ext==='.jpeg')return hex.startsWith('ffd8ff');
  if(ext==='.png')return hex.startsWith('89504e470d0a1a0a');
  if(ext==='.webp')return data.subarray(0,4).toString()==='RIFF'&&data.subarray(8,12).toString()==='WEBP';
  if(ext==='.pdf')return data.subarray(0,5).toString()==='%PDF-';
  if(ext==='.doc')return hex.startsWith('d0cf11e0a1b11ae1');
  if(ext==='.docx'||ext==='.zip')return hex.startsWith('504b0304')||hex.startsWith('504b0506')||hex.startsWith('504b0708');
  if(ext==='.mp4')return data.subarray(4,8).toString()==='ftyp';
  if(ext==='.svg'){const text=data.toString('utf8').toLowerCase();return text.includes('<svg')&&!/<script|<foreignobject|\son\w+\s*=|javascript:|data:text\/html/.test(text);}
  return false;
 }
}
