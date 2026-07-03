<script setup lang="ts">
import type {UploadProps,UploadRequestOptions} from 'element-plus'
import {ElMessage} from 'element-plus'
import {UploadFilled} from '@element-plus/icons-vue'
import {apiData,request} from '@/utils/request'
import type {UploadFileRecord} from '@/types/api'
const props=withDefaults(defineProps<{modelValue?:UploadFileRecord|null;accept?:string;kind?:'pdf'|'word'|'zip'|'file';maxSizeMb?:number}>(),{modelValue:null,accept:'.pdf,.doc,.docx,.zip',kind:'file',maxSizeMb:50})
const emit=defineEmits<{(e:'update:modelValue',value:UploadFileRecord|null):void}>()
const beforeUpload:UploadProps['beforeUpload']=(file)=>{if(file.size>props.maxSizeMb*1024*1024){ElMessage.error(`文件不能超过 ${props.maxSizeMb}MB`);return false}return true}
async function upload(options:UploadRequestOptions){const data=new FormData();data.append('file',options.file);try{const file=await apiData<UploadFileRecord>(request.post(`/admin/uploads/${props.kind}`,data,{onUploadProgress:e=>options.onProgress({percent:e.total?e.loaded/e.total*100:0} as never)}));emit('update:modelValue',file);options.onSuccess(file);ElMessage.success('文件上传成功')}catch(error){options.onError(error as never)}}
</script>
<template><el-upload drag :accept="accept" :limit="1" :before-upload="beforeUpload" :http-request="upload" :on-remove="()=>emit('update:modelValue',null)"><el-icon class="el-icon--upload"><UploadFilled/></el-icon><div class="el-upload__text">拖拽文件到此处，或<em>点击上传</em></div><template #tip><div class="el-upload__tip">支持 {{accept}}，单个文件不超过 {{maxSizeMb}}MB</div></template></el-upload></template>
