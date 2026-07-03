<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getPageContent, getSiteSettings } from '../../api/home'
import type { PageContent, SiteSettings } from '../../types/api'

const footer = ref<PageContent | null>(null)
const settings=ref<SiteSettings>({})
const footerError = ref('')
onMounted(async () => {
  try { [footer.value,settings.value] = await Promise.all([getPageContent('footer'),getSiteSettings()]) }
  catch (error) { footerError.value = error instanceof Error ? error.message : '页脚内容加载失败' }
})
</script>

<template>
  <footer class="site-footer">
    <div class="footer-pattern" aria-hidden="true"></div>
    <div class="container footer-grid">
      <div class="footer-about"><span class="eyebrow light">PANXIU OPEN ARCHIVE</span><h2>{{settings.site_name||'守望盘绣'}}</h2><p v-if="footer">{{ footer.description }}</p><p v-else-if="footerError" role="status">{{ footerError }}</p><p v-else role="status">正在读取页脚内容…</p></div>
      <div><h3>资源浏览</h3><RouterLink to="/patterns">纹样素材</RouterLink><RouterLink to="/documents">文献资料</RouterLink><RouterLink to="/creations">共创作品</RouterLink></div>
      <div><h3>文化脉络</h3><RouterLink to="/inheritors">传承人介绍</RouterLink><RouterLink to="/applications">应用案例</RouterLink><RouterLink to="/about">关于平台</RouterLink></div>
    </div>
    <div class="container footer-bottom"><p>{{ settings.copyright || footer?.content || (footerError ? '页脚说明暂不可用' : '正在读取页脚说明…') }}<span v-if="settings.icp"> · {{settings.icp}}</span></p><p>© {{ new Date().getFullYear() }} {{settings.site_name||'守望盘绣开放素材库'}}</p></div>
  </footer>
</template>
