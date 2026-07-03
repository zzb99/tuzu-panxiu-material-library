<script setup lang="ts">
defineProps<{ title: string }>()
</script>
<template><section class="placeholder-page"><div class="container"><span class="eyebrow">SECTION</span><h1>{{ title }}</h1><p>本阶段已建立前台路由入口，栏目列表、检索与详情将在后续阶段接入真实接口后开放。</p><RouterLink to="/" class="primary-link">返回首页</RouterLink></div></section></template>
