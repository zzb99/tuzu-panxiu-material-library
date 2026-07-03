<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {getSiteSettings} from '../../api/home'

const open = ref(false)
const siteName=ref('守望盘绣')
const siteSubtitle=ref('PANXIU OPEN ARCHIVE')
const route = useRoute()
const nav = [
  ['/', '首页'], ['/patterns', '纹样素材'], ['/documents', '文献资料'], ['/creations', '共创作品'],
  ['/inheritors', '传承人'], ['/applications', '应用案例'], ['/about', '关于平台'],
]
function close() { open.value = false }
watch(open, value => { document.body.style.overflow = value ? 'hidden' : '' })
onBeforeUnmount(() => { document.body.style.overflow = '' })
onMounted(async()=>{try{const settings=await getSiteSettings();siteName.value=settings.site_name||siteName.value;siteSubtitle.value=settings.site_subtitle||siteSubtitle.value}catch{/* 页头保留产品标识，不用业务内容假数据 */}})
</script>

<template>
  <header class="site-header" :class="{ 'site-header--overlay': route.path === '/' }">
    <div class="header-inner">
      <RouterLink class="brand" to="/" aria-label="守望盘绣开放素材库首页" @click="close">
        <span><strong>{{siteName}}</strong><small>{{siteSubtitle}}</small></span>
      </RouterLink>
      <button class="menu-button" type="button" :aria-expanded="open" aria-controls="main-navigation" @click="open = !open">
        <span></span><span></span><span></span><b>菜单</b>
      </button>
      <nav id="main-navigation" class="main-nav" :class="{ open }" aria-label="主导航">
        <RouterLink v-for="[path, label] in nav" :key="path" :to="path" :class="{ active: path === '/' ? route.path === '/' : route.path.startsWith(path) }" @click="close">{{ label }}</RouterLink>
      </nav>
    </div>
  </header>
</template>
