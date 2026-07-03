<script setup lang="ts">
import {onMounted,ref} from 'vue'
import {ElMessage} from 'element-plus'
import {listContents,setFeatured,type ContentRecord,type ResourceType} from '@/api/content'
type FeaturedRow=ContentRecord&{type:ResourceType}
const labels:Record<ResourceType,string>={pattern:'纹样',document:'文献',creation:'共创',inheritor:'传承人',application_case:'案例'}
const types=Object.keys(labels) as ResourceType[],items=ref<FeaturedRow[]>([]),loading=ref(false)
async function load(){loading.value=true;try{items.value=(await Promise.all(types.map(async type=>(await listContents({type,page:1,pageSize:100,sort:'default'})).items.filter(x=>Boolean(x.is_featured)).map(x=>({...x,type}))))).flat()}finally{loading.value=false}}
async function remove(row:FeaturedRow){await setFeatured(row.type,row.id,false);ElMessage.success('已取消首页推荐');await load()}
onMounted(load)
</script>
<template><section><div class="manager-head"><div><span class="eyebrow">HOMEPAGE</span><h1>首页推荐管理</h1><p>汇总当前五类内容真实接口中的推荐数据。</p></div></div><el-card><el-table v-loading="loading" :data="items"><el-table-column label="模块" width="110"><template #default="{row}">{{labels[row.type as ResourceType]}}</template></el-table-column><el-table-column prop="title" label="标题"/><el-table-column prop="status" label="状态" width="100"/><el-table-column prop="sort_order" label="排序" width="90"/><el-table-column label="操作" width="130"><template #default="{row}"><el-button link type="danger" @click="remove(row)">取消推荐</el-button></template></el-table-column></el-table></el-card></section></template>
