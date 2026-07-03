<script setup lang="ts">
import DOMPurify from 'dompurify'
import {computed} from 'vue'
const props=defineProps<{content:string}>()
const safe=computed(()=>DOMPurify.sanitize(props.content,{USE_PROFILES:{html:true}}))
</script>
<template><div v-html="safe"></div></template>
