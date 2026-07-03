import { BadRequestException, Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseIntPipe, Post, Put, Query, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { mkdirSync, unlinkSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { resolveUploadDir } from '../config/paths';
import { ResourceType } from '../contents/dto/content-query.dto';
import { DownloadFileDto } from './files.dto';
import { FilesService } from './files.service';
const allowed=new Set(['.jpg','.jpeg','.png','.webp','.svg','.pdf','.doc','.docx','.zip','.mp4']);
const hardUploadLimit=50*1024*1024;
const storage=diskStorage({destination:(_req,file,cb)=>{const ext=extname(file.originalname).toLowerCase();const group=['.jpg','.jpeg','.png','.webp','.svg'].includes(ext)?'images':ext==='.mp4'?'videos':'files';const dir=resolve(resolveUploadDir(process.env.UPLOAD_DIR || 'uploads'),group);mkdirSync(dir,{recursive:true});cb(null,dir);},filename:(_req,file,cb)=>cb(null,`${Date.now()}-${randomUUID()}${extname(file.originalname).toLowerCase()}`)});
const imageExt=new Set(['.jpg','.jpeg','.png','.webp','.svg']);
const kindExt:Record<string,Set<string>>={image:imageExt,pdf:new Set(['.pdf']),word:new Set(['.doc','.docx']),zip:new Set(['.zip']),video:new Set(['.mp4']),file:allowed};
const filter=(req:{originalUrl?:string},file:Express.Multer.File,cb:(error:Error|null,accept:boolean)=>void)=>{const ext=extname(file.originalname).toLowerCase();if(!allowed.has(ext))return cb(new BadRequestException('不允许的文件类型'),false);const kind=req.originalUrl?.match(/\/uploads\/(images|image|pdf|word|zip|video)(?:\?|$)/)?.[1];if(kind==='images'&&!imageExt.has(ext))return cb(new BadRequestException('批量图片接口仅允许图片'),false);if(kind&&kind!=='images'&&!kindExt[kind]?.has(ext))return cb(new BadRequestException(`该接口不允许 ${ext} 文件`),false);cb(null,true);};
@Controller()
export class FilesController{
 constructor(private readonly s:FilesService,private readonly config:ConfigService){}
 @Post('admin/uploads') @UseGuards(JwtAuthGuard) @UseInterceptors(FileInterceptor('file',{storage,fileFilter:filter,limits:{fileSize:hardUploadLimit}})) async upload(@UploadedFile()file?:Express.Multer.File){if(!file)throw new BadRequestException('请选择文件');this.checkSize(file);return this.s.validateAndRecord(file);}
 @Post('admin/uploads/:kind') @UseGuards(JwtAuthGuard) @UseInterceptors(FileInterceptor('file',{storage,fileFilter:filter,limits:{fileSize:hardUploadLimit}})) async uploadKind(@Param('kind')kind:string,@UploadedFile()file?:Express.Multer.File){if(!kindExt[kind])throw new BadRequestException('上传类型无效');if(!file)throw new BadRequestException('请选择文件');this.checkSize(file);return this.s.validateAndRecord(file);}
 @Post('admin/uploads/images') @UseGuards(JwtAuthGuard) @UseInterceptors(FilesInterceptor('files',20,{storage,fileFilter:filter,limits:{fileSize:hardUploadLimit}})) async images(@UploadedFiles()files:Express.Multer.File[]){if(!files?.length)throw new BadRequestException('请选择图片');const max=this.config.getOrThrow<number>('MAX_UPLOAD_SIZE');if(files.some(f=>f.size>max)){files.forEach(f=>unlinkSync(f.path));throw new BadRequestException('文件超过大小限制');}return Promise.all(files.map(f=>this.s.validateAndRecord(f)));}
 @Get('admin/media-files') @UseGuards(JwtAuthGuard) media(@Query('page')page='1',@Query('pageSize')size='20',@Query('type')type?:string){return this.s.listMedia(Number(page),Number(size),type);}
 @Delete('admin/media-files/:id') @UseGuards(JwtAuthGuard) deleteMedia(@Param('id',ParseIntPipe)id:number){return this.s.removeMedia(String(id));}
 @Post('admin/download-files') @UseGuards(JwtAuthGuard) add(@Body()d:DownloadFileDto){return this.s.addDownload(d);}
 @Put('admin/download-files/:id') @UseGuards(JwtAuthGuard) replace(@Param('id',ParseIntPipe)id:number,@Body()d:DownloadFileDto){return this.s.replaceDownload(String(id),d);}
 @Delete('admin/download-files/:id') @UseGuards(JwtAuthGuard) remove(@Param('id',ParseIntPipe)id:number){return this.s.removeDownload(String(id));}
 @Get('admin/download-files/:type/:resourceId') @UseGuards(JwtAuthGuard) listAdmin(@Param('type',new ParseEnumPipe(ResourceType))type:ResourceType,@Param('resourceId',ParseIntPipe)id:number){return this.s.listDownloads(type,String(id),false);}
 @Get('download-files/:type/:resourceId') list(@Param('type',new ParseEnumPipe(ResourceType))type:ResourceType,@Param('resourceId',ParseIntPipe)id:number){return this.s.listDownloads(type,String(id),true);}
 @Get('downloads/:id') async download(@Param('id',ParseIntPipe)id:number,@Res()res:Response){const f=await this.s.stream(String(id));res.setHeader('Content-Type',f.mime||'application/octet-stream');res.setHeader('Content-Length',String(f.size));res.setHeader('Content-Disposition',`attachment; filename*=UTF-8''${encodeURIComponent(f.name)}`);f.stream.pipe(res);}
 private checkSize(file:Express.Multer.File){if(file.size>this.config.getOrThrow<number>('MAX_UPLOAD_SIZE')){unlinkSync(file.path);throw new BadRequestException('文件超过大小限制');}}
}
