import axios,{AxiosError} from 'axios'
import {ElMessage} from 'element-plus'
import router from '@/router'
import {getToken,removeToken} from './auth'
import type {ApiResponse} from '@/types/api'
const baseURL=import.meta.env.VITE_API_BASE_URL?.trim()
if(!baseURL) throw new Error('缺少 VITE_API_BASE_URL，请检查 admin 环境变量')
export const request=axios.create({baseURL,timeout:15000})
request.interceptors.request.use(config=>{const token=getToken();if(token)config.headers.Authorization=`Bearer ${token}`;return config})
request.interceptors.response.use(response=>{const body=response.data as ApiResponse<unknown>;if(body?.code!==0)return Promise.reject(new Error(body?.message||'接口返回异常'));return response},async(error:AxiosError<ApiResponse<null>>)=>{const message=error.response?.data?.message||error.message||'网络请求失败';if(error.response?.status===401){removeToken();if(router.currentRoute.value.name!=='login')await router.replace({name:'login',query:{redirect:router.currentRoute.value.fullPath}});ElMessage.error('登录已失效，请重新登录')}else ElMessage.error(message);return Promise.reject(error)})
export const apiData=<T>(promise:Promise<{data:ApiResponse<T>}>)=>promise.then(res=>res.data.data)
