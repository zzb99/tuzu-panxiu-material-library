<script setup lang="ts">
import {reactive,ref} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import type {FormInstance,FormRules} from 'element-plus'
import {ElMessage} from 'element-plus'
import {login} from '@/api/auth'
import {setToken} from '@/utils/auth'
const formRef=ref<FormInstance>(),loading=ref(false),form=reactive({username:'',password:''}),router=useRouter(),route=useRoute()
const rules:FormRules={username:[{required:true,message:'请输入管理员账号',trigger:'blur'}],password:[{required:true,message:'请输入密码',trigger:'blur'}]}
async function submit(){if(!await formRef.value?.validate().catch(()=>false))return;loading.value=true;try{const result=await login(form);setToken(result.token);ElMessage.success('登录成功');const redirect=typeof route.query.redirect==='string'&&route.query.redirect.startsWith('/')?route.query.redirect:'/dashboard';await router.replace(redirect)}finally{loading.value=false}}
</script>
<template><main class="login-page"><section class="login-intro"><div class="intro-content"><span class="eyebrow">TUZU PANXIU ARCHIVE</span><h1>让每一枚纹样<br/>被妥善看见</h1><p>土族盘绣纹样开放素材库 · 内容管理后台</p></div><div class="stitch-pattern" aria-hidden="true"></div></section><section class="login-panel"><div class="login-card"><div class="mobile-brand">盘绣素材库</div><h2>管理员登录</h2><p class="login-hint">登录后可维护平台内容、分类与文件资源</p><el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @keyup.enter="submit"><el-form-item label="管理员账号" prop="username"><el-input v-model="form.username" autocomplete="username" placeholder="请输入管理员账号"/></el-form-item><el-form-item label="密码" prop="password"><el-input v-model="form.password" type="password" show-password autocomplete="current-password" placeholder="请输入密码"/></el-form-item><el-button type="primary" class="login-submit" :loading="loading" @click="submit">进入管理后台</el-button></el-form><p class="security-tip">仅限平台管理员使用，请妥善保管账号信息</p></div></section></main></template>
