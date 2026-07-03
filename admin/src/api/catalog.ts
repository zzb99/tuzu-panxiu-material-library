import {apiData,request} from '@/utils/request'
import type {PageResult} from '@/types/api'
export interface CatalogRecord{[key:string]:unknown;id:number;name?:string;title?:string;status:string;sort_order:number}
export const listCatalog=(kind:string,params:Record<string,unknown>)=>apiData<PageResult<CatalogRecord>>(request.get(`/admin/${kind}`,{params}))
export const getCatalog=(kind:string,id:number)=>apiData<CatalogRecord>(request.get(`/admin/${kind}/${id}`))
export const saveCatalog=(kind:string,id:number|undefined,data:Record<string,unknown>)=>apiData<CatalogRecord>(id?request.put(`/admin/${kind}/${id}`,data):request.post(`/admin/${kind}`,data))
export const deleteCatalog=(kind:string,id:number)=>apiData(request.delete(`/admin/${kind}/${id}`))
