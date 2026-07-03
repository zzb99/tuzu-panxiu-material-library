<script setup lang="ts">
import {computed,onMounted,ref} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {ArrowDown,Fold,Expand} from '@element-plus/icons-vue'
import {ElMessageBox} from 'element-plus'
import {menuItems} from '@/config/menu'
import {getProfile} from '@/api/auth'
import {removeToken} from '@/utils/auth'
import type {AdminProfile} from '@/types/api'
const route=useRoute(),router=useRouter(),collapsed=ref(false),profile=ref<AdminProfile|null>(null)
const title=computed(()=>String(route.meta.title||'管理后台'))
onMounted(async()=>{try{profile.value=await getProfile()}catch{/* 401 由请求拦截器处理 */}})
async function logout(){await ElMessageBox.confirm('确定退出管理后台吗？','退出登录',{confirmButtonText:'退出',cancelButtonText:'取消',type:'warning'});removeToken();await router.replace('/login')}
</script>
<template><el-container class="admin-shell">
 <el-aside :width="collapsed?'72px':'248px'" class="sidebar">
  <div class="brand"><div class="brand-mark">盘</div><div v-show="!collapsed" class="brand-copy"><strong>盘绣素材库</strong><span>内容管理后台</span></div></div>
  <el-scrollbar><el-menu :default-active="route.path" router :collapse="collapsed" :collapse-transition="false"><el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path"><el-icon><component :is="item.icon"/></el-icon><template #title>{{item.label}}</template></el-menu-item></el-menu></el-scrollbar>
 </el-aside>
 <el-container><el-header class="topbar"><button class="collapse-button" :aria-label="collapsed?'展开菜单':'收起菜单'" @click="collapsed=!collapsed"><el-icon><component :is="collapsed?Expand:Fold"/></el-icon></button><div class="page-title">{{title}}</div><el-dropdown trigger="click"><button class="admin-button"><span class="avatar">{{(profile?.displayName||profile?.username||'管').slice(0,1)}}</span><span>{{profile?.displayName||profile?.username||'管理员'}}</span><el-icon><ArrowDown/></el-icon></button><template #dropdown><el-dropdown-menu><el-dropdown-item @click="logout">退出登录</el-dropdown-item></el-dropdown-menu></template></el-dropdown></el-header>
 <el-main class="main-area"><router-view/></el-main></el-container>
 </el-container></template>
