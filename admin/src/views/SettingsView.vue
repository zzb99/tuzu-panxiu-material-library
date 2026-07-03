<script setup lang="ts">
import {onMounted,reactive,ref} from 'vue'
import {ElMessage} from 'element-plus'
import {apiData,request} from '@/utils/request'
const loading=ref(true),saving=ref(false)
const form=reactive({siteName:'',siteSubtitle:'',contact:'',copyright:'',icp:''})
async function load(){loading.value=true;try{const data=await apiData<Record<string,string|null>>(request.get('/admin/site-settings'));form.siteName=data.site_name||'';form.siteSubtitle=data.site_subtitle||'';form.contact=data.contact||'';form.copyright=data.copyright||'';form.icp=data.icp||''}finally{loading.value=false}}
async function save(){if(!form.siteName.trim()||!form.siteSubtitle.trim())return ElMessage.warning('请填写网站名称和副标题');saving.value=true;try{await apiData(request.put('/admin/site-settings',form));ElMessage.success('网站设置已保存')}finally{saving.value=false}}
onMounted(load)
</script>
<template><section><div class="manager-head"><div><span class="eyebrow">SETTINGS</span><h1>网站设置</h1><p>维护前台基础名称、联系和版权信息。</p></div></div><el-card v-loading="loading"><el-form label-position="top" style="max-width:760px"><el-form-item label="网站名称" required><el-input v-model="form.siteName" maxlength="120" show-word-limit/></el-form-item><el-form-item label="网站副标题" required><el-input v-model="form.siteSubtitle" maxlength="255" show-word-limit/></el-form-item><el-form-item label="联系方式"><el-input v-model="form.contact" maxlength="500"/></el-form-item><el-form-item label="版权说明"><el-input v-model="form.copyright" type="textarea" :rows="4" maxlength="1000" show-word-limit/></el-form-item><el-form-item label="备案信息"><el-input v-model="form.icp" maxlength="120"/></el-form-item><el-button type="primary" :loading="saving" @click="save">保存设置</el-button></el-form></el-card></section></template>
