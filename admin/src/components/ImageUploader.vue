<script setup lang="ts">
import {computed} from 'vue'
import type {UploadProps,UploadRequestOptions} from 'element-plus'
import {ElMessage} from 'element-plus'
import {Plus,Delete} from '@element-plus/icons-vue'
import {apiData,request} from '@/utils/request'
import type {UploadFileRecord} from '@/types/api'
const props=withDefaults(defineProps<{modelValue?:UploadFileRecord|null;maxSizeMb?:number}>(),{modelValue:null,maxSizeMb:10})
const emit=defineEmits<{(e:'update:modelValue',value:UploadFileRecord|null):void}>(),preview=computed(()=>{const url=props.modelValue?.file_url;if(!url)return '';if(/^https?:\/\//.test(url))return url;return new URL(url,import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/,'/')).toString()})
const beforeUpload:UploadProps['beforeUpload']=(file)=>{if(!file.type.startsWith('image/')){ElMessage.error('请选择图片文件');return false}if(file.size>props.maxSizeMb*1024*1024){ElMessage.error(`图片不能超过 ${props.maxSizeMb}MB`);return false}return true}
async function upload(options:UploadRequestOptions){const data=new FormData();data.append('file',options.file);try{const file=await apiData<UploadFileRecord>(request.post('/admin/uploads/image',data,{onUploadProgress:e=>options.onProgress({percent:e.total?e.loaded/e.total*100:0} as never)}));emit('update:modelValue',file);options.onSuccess(file);ElMessage.success('图片上传成功')}catch(error){options.onError(error as never)}}
</script>
<template><div class="image-uploader"><div v-if="preview" class="image-preview"><img :src="preview" alt="已上传图片"/><el-button circle type="danger" :icon="Delete" aria-label="移除图片" @click="emit('update:modelValue',null)"/></div><el-upload v-else drag :show-file-list="false" accept=".jpg,.jpeg,.png,.webp,.svg" :before-upload="beforeUpload" :http-request="upload"><el-icon class="upload-icon"><Plus/></el-icon><div>拖拽图片到此处，或<em>点击上传</em></div><template #tip><div class="el-upload__tip">支持 JPG、PNG、WebP、SVG，单张不超过 {{maxSizeMb}}MB</div></template></el-upload></div></template>
