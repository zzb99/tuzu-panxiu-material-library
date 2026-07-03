<script setup lang="ts">
import {nextTick,ref,watch} from 'vue'
const props=withDefaults(defineProps<{modelValue:string;placeholder?:string}>(),{placeholder:'请输入正文内容…'})
const emit=defineEmits<{(e:'update:modelValue',value:string):void}>(),editor=ref<HTMLElement>()
watch(()=>props.modelValue,async value=>{await nextTick();if(editor.value&&editor.value.innerHTML!==value)editor.value.innerHTML=value},{immediate:true})
function command(name:string,value?:string){editor.value?.focus();document.execCommand(name,false,value);sync()}
function sync(){emit('update:modelValue',editor.value?.innerHTML||'')}
function addLink(){const url=window.prompt('请输入链接地址');if(url)command('createLink',url)}
</script>
<template><div class="rich-editor"><div class="editor-toolbar" aria-label="正文格式工具"><button type="button" @click="command('formatBlock','h2')">标题</button><button type="button" @click="command('bold')"><b>加粗</b></button><button type="button" @click="command('italic')"><i>斜体</i></button><button type="button" @click="command('insertUnorderedList')">列表</button><button type="button" @click="addLink">链接</button><button type="button" @click="command('removeFormat')">清除格式</button></div><div ref="editor" class="editor-content" contenteditable="true" :data-placeholder="placeholder" @input="sync"></div></div></template>
