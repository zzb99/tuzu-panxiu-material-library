const TOKEN_KEY='tuzu_panxiu_admin_token'
export const getToken=()=>localStorage.getItem(TOKEN_KEY)
export const setToken=(token:string)=>localStorage.setItem(TOKEN_KEY,token)
export const removeToken=()=>localStorage.removeItem(TOKEN_KEY)
