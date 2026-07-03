<script setup lang="ts">
import {onMounted,reactive,ref} from 'vue'
import {ElMessage,ElMessageBox} from 'element-plus'
import {deleteMedia,listMedia} from '@/api/media'
import type {UploadFileRecord} from '@/types/api'
const loading=ref(false),items=ref<UploadFileRecord[]>([]),total=ref(0),q=reactive({page:1,pageSize:20,type:''})
const assetUrl=(url:string)=>/^https?:/.test(url)?url:new URL(url,import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/,'/')).toString()
const size=(bytes:number)=>bytes<1024?`${bytes} B`:bytes<1024*1024?`${(bytes/1024).toFixed(1)} KB`:`${(bytes/1024/1024).toFixed(1)} MB`
async function load(){loading.value=true;try{const result=await listMedia({...q,type:q.type||undefined});items.value=result.items;total.value=result.total}finally{loading.value=false}}
async function remove(row:UploadFileRecord){await ElMessageBox.confirm('仅未被内容引用的文件可以删除。确定继续吗？','删除文件',{type:'warning'});await deleteMedia(row.id);ElMessage.success('文件已删除');await load()}
onMounted(load)
</script>
<template><section><div class="manager-head"><div><span class="eyebrow">MEDIA LIBRARY</span><h1>文件管理</h1><p>查看上传记录并清理未被内容引用的文件。</p></div></div><el-card><el-form inline><el-form-item label="类型"><el-select v-model="q.type" clearable style="width:150px" @change="q.page=1;load()"><el-option label="图片" value="image"/><el-option label="PDF" value="pdf"/><el-option label="Word" value="word"/><el-option label="ZIP" value="zip"/><el-option label="视频" value="video"/><el-option label="其他" value="other"/></el-select></el-form-item><el-button @click="load">刷新</el-button></el-form><el-table v-loading="loading" :data="items"><el-table-column label="文件名" min-width="240"><template #default="{row}"><a :href="assetUrl(row.file_url)" target="_blank" rel="noopener">{{row.file_name}}</a></template></el-table-column><el-table-column prop="file_type" label="类型" width="100"/><el-table-column label="大小" width="120"><template #default="{row}">{{size(row.file_size)}}</template></el-table-column><el-table-column prop="file_url" label="相对路径" min-width="260"/><el-table-column label="操作" width="100"><template #default="{row}"><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column></el-table><el-pagination v-model:current-page="q.page" v-model:page-size="q.pageSize" :total="total" layout="total, sizes, prev, pager, next" @change="load"/></el-card></section></template>
