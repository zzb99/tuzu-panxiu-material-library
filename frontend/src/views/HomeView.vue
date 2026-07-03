<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getBanners, getFeatured, getPageContent } from '../api/home'
import { getCategories, getContents } from '../api/content'
import { ApiError, resolveAssetUrl } from '../api/http'
import type { Banner, FeaturedGroups, PageContent, ResourceType } from '../types/api'
import SectionHeading from '../components/common/SectionHeading.vue'
import StatePanel from '../components/common/StatePanel.vue'
import ResourceSection from '../components/home/ResourceSection.vue'

const emptyGroups = (): FeaturedGroups => ({ pattern: [], document: [], creation: [], inheritor: [], application_case: [] })
const banners = ref<Banner[]>([])
const groups = ref<FeaturedGroups>(emptyGroups())
const about = ref<PageContent | null>(null)
const culture = ref<PageContent | null>(null)
const partners = ref<PageContent | null>(null)
const loading = ref(true)
const errors = ref({ banners: '', featured: '', about: '', culture: '', partners: '', stats: '' })
const missingPages = ref({ about: false, culture: false, partners: false })
const activeBanner = ref(0)
const searchKeyword = ref('')
const latestPatterns = ref<FeaturedGroups['pattern']>([])
const patternTotal = ref(0)
const patternCategoryTotal = ref(0)
const documentTotal = ref(0)
const inheritorTotal = ref(0)
const router = useRouter()

const group = (type: ResourceType) => groups.value[type] || []
const heroBackground = computed(() => banners.value[activeBanner.value]?.image_url ? `url("${resolveAssetUrl(banners.value[activeBanner.value].image_url)}")` : undefined)
const totalFeatured = computed(() => Object.values(groups.value).reduce((sum, items) => sum + items.length, 0))
const hasAnyFeatured = computed(() => totalFeatured.value > 0)
const patternItems = computed(() => (latestPatterns.value.length ? latestPatterns.value : group('pattern')).slice(0, 4))

async function loadBanners() {
  errors.value.banners = ''
  try { banners.value = (await getBanners()).items } catch (error) { errors.value.banners = error instanceof Error ? error.message : 'Banner 加载失败' }
}
async function loadFeatured() {
  errors.value.featured = ''
  try { groups.value = await getFeatured() } catch (error) { errors.value.featured = error instanceof Error ? error.message : '推荐内容加载失败' }
}
async function loadPage(key: 'about' | 'culture' | 'partners') {
  errors.value[key] = ''
  missingPages.value[key] = false
  try {
    const value = await getPageContent(key)
    if (key === 'about') about.value = value
    if (key === 'culture') culture.value = value
    if (key === 'partners') partners.value = value
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) missingPages.value[key] = true
    else errors.value[key] = error instanceof Error ? error.message : '页面内容加载失败'
  }
}
async function loadAll() {
  loading.value = true
  errors.value.stats = ''
  try { const results = await Promise.allSettled([
    loadBanners(), loadFeatured(), loadPage('about'), loadPage('culture'), loadPage('partners'),
    getContents('pattern', { page: 1, pageSize: 24, sort: 'latest' }).then(result => { latestPatterns.value = result.items; patternTotal.value = result.total }),
    getCategories('pattern').then(result => { patternCategoryTotal.value = result.total }),
    getContents('document', { page: 1, pageSize: 1, sort: 'latest' }).then(result => { documentTotal.value = result.total }),
    getContents('inheritor', { page: 1, pageSize: 1, sort: 'latest' }).then(result => { inheritorTotal.value = result.total }),
  ]); if (results.slice(5).some(result => result.status === 'rejected')) errors.value.stats = '部分统计暂时无法读取。' }
  finally { loading.value = false }
}
function submitSearch() {
  router.push({ path: '/patterns', query: searchKeyword.value.trim() ? { keyword: searchKeyword.value.trim() } : {} })
}
onMounted(loadAll)
</script>

<template>
  <div class="home-page">
    <section class="hero" aria-label="首页主视觉">
      <div class="hero-slide hero-static-bg" :style="heroBackground ? { backgroundImage: heroBackground } : undefined" aria-hidden="true"></div>
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <h1>开放素材库</h1>
        <form class="hero-search" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="home-pattern-search">搜索盘绣纹样</label>
          <input id="home-pattern-search" v-model="searchKeyword" type="search" autocomplete="off" />
          <button type="submit" aria-label="搜索">●</button>
        </form>
      </div>
      <div class="hero-stats" aria-label="素材库概览">
        <div><span>纹样分类</span><strong>{{ patternCategoryTotal || '—' }}</strong><em>类</em></div>
        <div><span>纹样素材</span><strong>{{ patternTotal || '—' }}</strong><em>个</em></div>
        <div><span>文献资料</span><strong>{{ documentTotal }}</strong><em>篇</em></div>
        <div><span>传承档案</span><strong>{{ inheritorTotal }}</strong><em>位</em></div>
      </div>
    </section>

    <ResourceSection class="pattern-showcase" eyebrow="PATTERN ARCHIVE" title="纹样素材库" description="按分类浏览已整理的盘绣纹样，查看细节并直接下载原图。" to="/patterns" :items="patternItems" :loading="loading" variant="grid" />

    <section v-if="culture" class="culture-section">
      <div class="container culture-grid">
        <div class="culture-image culture-image--provided" role="img" aria-label="土族盘绣浅色纹样与山水背景"></div>
        <div class="culture-copy"><span class="eyebrow light">INTANGIBLE CULTURAL HERITAGE</span><h2>{{ culture.title }}</h2><p>{{ culture.description }}</p><div v-if="culture.content" class="rich-summary">{{ culture.content }}</div><RouterLink class="culture-link" to="/about">了解守望盘绣 <span>↗</span></RouterLink></div>
      </div>
    </section>
    <div v-else-if="errors.culture" class="container featured-error"><StatePanel state="error" :message="errors.culture" @retry="loadPage('culture')" /></div>

    <div v-if="errors.featured" class="container featured-error"><StatePanel state="error" :message="errors.featured" @retry="loadFeatured" /></div>
    <template v-if="!errors.featured">
      <ResourceSection eyebrow="RESEARCH & RECORDS" title="文献资料推荐" description="汇集研究、记录与保护资料，建立可追溯的知识脉络。" to="/documents" :items="group('document')" :loading="loading" variant="list" />
      <ResourceSection eyebrow="CO-CREATION" title="共创作品推荐" description="传统视觉语言在当代创作中的开放转译。" to="/creations" :items="group('creation')" :loading="loading" variant="feature" />
      <ResourceSection eyebrow="LIVING HERITAGE" title="传承人推荐" description="记录技艺持有者的实践、讲述与传承路径。" to="/inheritors" :items="group('inheritor')" :loading="loading" variant="portrait" />
      <ResourceSection eyebrow="CONTEMPORARY PRACTICE" title="应用案例推荐" description="观察盘绣纹样如何进入当代设计与公共文化场景。" to="/applications" :items="group('application_case')" :loading="loading" variant="grid" />
    </template>
    <div v-if="!loading && !errors.featured && !hasAnyFeatured" class="container"><StatePanel state="empty" message="后台尚未设置已上架的首页推荐内容" /></div>

    <section v-if="partners" class="partners-section">
      <div class="container"><SectionHeading eyebrow="PARTNERS" title="合作单位" description="共同推动土族盘绣资源的整理、研究与开放传播。" />
        <div class="partners-content"><h3>{{ partners.title }}</h3><p>{{ partners.description }}</p><div class="rich-summary">{{ partners.content }}</div></div>
      </div>
    </section>
  </div>
</template>
