import {apiData,request} from '@/utils/request'
import type {AdminProfile,LoginResult} from '@/types/api'
export const login=(payload:{username:string;password:string})=>apiData<LoginResult>(request.post('/admin/auth/login',payload))
export const getProfile=()=>apiData<AdminProfile>(request.get('/admin/auth/profile'))
export interface AdminUserRecord extends AdminProfile{status:'active'|'disabled';lastLoginAt?:string|null;createdAt?:string}
export const changePassword=(payload:{currentPassword:string;newPassword:string})=>apiData(request.patch('/admin/auth/password',payload))
export const listAdmins=()=>apiData<AdminUserRecord[]>(request.get('/admin/admin-users'))
export const createAdmin=(payload:{username:string;password:string;displayName:string;email?:string|null})=>apiData<AdminUserRecord>(request.post('/admin/admin-users',payload))
export const updateAdmin=(id:string,payload:{displayName:string;email?:string|null;status:'active'|'disabled'})=>apiData<AdminUserRecord>(request.put(`/admin/admin-users/${id}`,payload))
