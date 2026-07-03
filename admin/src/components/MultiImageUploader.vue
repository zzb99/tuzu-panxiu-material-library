<script setup lang="ts">
import type {UploadRequestOptions} from 'element-plus'
import {ElMessage} from 'element-plus'
import {apiData,request} from '@/utils/request'
import type {UploadFileRecord} from '@/types/api'
const emit=defineEmits<{(e:'uploaded',files:UploadFileRecord[]):void}>()
async function upload(o:UploadRequestOptions){const data=new FormData();data.append('files',o.file);try{const files=await apiData<UploadFileRecord[]>(request.post('/admin/uploads/images',data,{onUploadProgress:e=>o.onProgress({percent:e.total?e.loaded/e.total*100:0} as never)}));emit('uploaded',files);o.onSuccess(files);ElMessage.success('图片上传成功')}catch(e){o.onError(e as never)}}
</script>
<template><el-upload multiple drag accept=".jpg,.jpeg,.png,.webp,.svg" :show-file-list="false" :http-request="upload"><div>拖拽或点击批量上传详情图片</div><template #tip><div class="el-upload__tip">每次最多 20 张；上传后可设置顺序</div></template></el-upload></template>
