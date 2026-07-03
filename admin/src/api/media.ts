import {apiData,request} from '@/utils/request'
import type {PageResult,UploadFileRecord} from '@/types/api'
export const listMedia=(params:{page:number;pageSize:number;type?:string})=>apiData<PageResult<UploadFileRecord>>(request.get('/admin/media-files',{params}))
export const deleteMedia=(id:string)=>apiData(request.delete(`/admin/media-files/${id}`))
