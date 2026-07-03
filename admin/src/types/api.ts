export interface ApiResponse<T>{code:number;message:string;data:T}
export interface AdminProfile{id:string;username:string;displayName:string;email:string|null}
export interface LoginResult{token:string;admin:AdminProfile}
export interface PageResult<T>{items:T[];page:number;pageSize:number;total:number;totalPages:number}
export interface UploadFileRecord{id:string;file_url:string;file_name:string;file_size:number;file_type:string;mime_type?:string}
