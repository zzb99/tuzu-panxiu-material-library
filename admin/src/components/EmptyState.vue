<script setup lang="ts">
withDefaults(defineProps<{ title?: string; description?: string }>(), {
  title: '暂无内容',
  description: '当前还没有可展示的数据',
})
</script>
<template><div class="empty-state"><el-empty :description="title" :image-size="96"><p>{{description}}</p><slot/></el-empty></div></template>
