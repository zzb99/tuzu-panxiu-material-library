import {apiData,request} from '@/utils/request'
import type {PageResult} from '@/types/api'
export const contentTypes=['pattern','document','creation','inheritor','application_case'] as const
export const getContentTotal=(type:string)=>apiData<PageResult<unknown>>(request.get('/admin/contents',{params:{type,page:1,pageSize:1}})).then(x=>x.total)
export const getListTotal=(path:string)=>apiData<PageResult<unknown>>(request.get(path,{params:{page:1,pageSize:1}})).then(x=>x.total)
