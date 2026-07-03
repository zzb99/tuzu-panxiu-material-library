import {apiData,request} from '@/utils/request'
import DOMPurify from 'dompurify'
import type {PageResult,UploadFileRecord} from '@/types/api'

export type Status='draft'|'published'|'offline'
export type ResourceType='pattern'|'document'|'creation'|'inheritor'|'application_case'
export interface ContentRecord{[key:string]:unknown;id:number;title:string;cover_image?:string;description?:string;content?:string;tags?:string[]|string;status:Status;sort_order:number;is_featured:number|boolean;images?:PatternImage[];downloadFiles?:DownloadFile[]}
export interface PatternImage{id:number;image_url:string;alt_text?:string;sort_order:number}
export interface DownloadFile{id:number;file_name:string;file_url:string;file_type:string;file_size:number}
export const listContents=(params:Record<string,unknown>)=>apiData<PageResult<ContentRecord>>(request.get('/admin/contents',{params}))
export const getContent=(type:ResourceType,id:number)=>apiData<ContentRecord>(request.get(`/admin/contents/${type}/${id}`)).then(item=>({...item,content:DOMPurify.sanitize(item.content||'')} as ContentRecord))
export const saveContent=(type:ResourceType,id:number|undefined,data:Record<string,unknown>)=>apiData<ContentRecord>(id?request.put(`/admin/contents/${type}/${id}`,data):request.post(`/admin/contents/${type}`,data))
export const deleteContent=(type:ResourceType,id:number)=>apiData(request.delete(`/admin/contents/${type}/${id}`))
export const setStatus=(type:ResourceType,id:number,status:Status)=>apiData(request.patch(`/admin/contents/${type}/${id}/status`,{status}))
export const setSort=(type:ResourceType,id:number,sortOrder:number)=>apiData(request.patch(`/admin/contents/${type}/${id}/sort`,{sortOrder}))
export const setFeatured=(type:ResourceType,id:number,isFeatured:boolean)=>apiData(request.patch(`/admin/contents/${type}/${id}/featured`,{isFeatured}))
export const addPatternImage=(id:number,data:Record<string,unknown>)=>apiData<PatternImage>(request.post(`/admin/patterns/${id}/images`,data))
export const updatePatternImage=(id:number,data:Record<string,unknown>)=>apiData<PatternImage>(request.put(`/admin/pattern-images/${id}`,data))
export const deletePatternImage=(id:number)=>apiData(request.delete(`/admin/pattern-images/${id}`))
export const addDownload=(type:ResourceType,resourceId:number,file:UploadFileRecord)=>apiData<DownloadFile>(request.post('/admin/download-files',{resourceType:type,resourceId,mediaFileId:Number(file.id),fileName:file.file_name}))
export const deleteDownload=(id:number)=>apiData(request.delete(`/admin/download-files/${id}`))
