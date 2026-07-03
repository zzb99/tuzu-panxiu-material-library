<script setup lang="ts">
import {computed} from 'vue'
import {useRoute} from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
const route=useRoute(),title=computed(()=>String(route.meta.title||'功能模块'))
</script>
<template><section class="content-card"><header class="section-header"><div><span class="eyebrow">CONTENT MANAGEMENT</span><h1>{{title}}</h1><p>后台框架与路由入口已就绪，具体数据列表和编辑闭环将在后续内容管理阶段对接真实接口。</p></div></header><EmptyState title="功能入口已准备好" description="本阶段不使用静态假数据，等待后续接入真实业务接口。"/></section></template>
