<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getContent, getContents } from '../api/content'
import { assetOrigin, ApiError } from '../api/http'
import LazyImage from '../components/common/LazyImage.vue'
import ResourceCard from '../components/content/ResourceCard.vue'
import StatePanel from '../components/common/StatePanel.vue'
import SafeHtml from '../components/common/SafeHtml.vue'
import { byType } from '../config/resources'
import type { ContentItem, ResourceType } from '../types/api'

const props = defineProps<{ type: ResourceType }>()
const route = useRoute(), router = useRouter(), item = ref<ContentItem | null>(null), related = ref<ContentItem[]>([]), loading = ref(true), error = ref(''), activeImage = ref('')
const config = computed(() => byType[props.type])
const tags = computed(() => Array.isArray(item.value?.tags) ? item.value?.tags : [])
const imageGallery = computed(() => { const urls = [item.value?.cover_image, item.value?.image_url, ...(item.value?.images?.map(image => image.image_url) || [])].filter(Boolean) as string[]; return [...new Set(urls)] })
const facts = computed(() => {
  if (!item.value) return []
  const fields: Record<string, string> = { source_area: '来源地区', application_part: '应用部位', craft_type: '工艺', meaning: '文化寓意', author: '作者', source: '文献来源', year: '年份', creator_name: '创作者', creation_date: '创作日期', level: '级别', region: '地区', birth_year: '出生年份', case_type: '案例类型', client_name: '项目方', case_date: '案例日期' }
  return Object.entries(fields).filter(([key]) => item.value?.[key] !== null && item.value?.[key] !== undefined && item.value?.[key] !== '').map(([key, label]) => ({ label, value: String(item.value?.[key]) }))
})
function downloadUrl(id: number) { return `${assetOrigin}/api/downloads/${id}` }
async function load() {
  loading.value = true; error.value = ''; item.value = null
  try {
    item.value = await getContent(props.type, String(route.params.id)); activeImage.value = imageGallery.value[0] || ''
    const response = await getContents(props.type, { page: 1, pageSize: 4, categoryId: item.value.category_id || undefined })
    related.value = response.items.filter(candidate => candidate.id !== item.value?.id).slice(0, 3)
  } catch (e) { error.value = e instanceof ApiError ? e.message : '详情加载失败' }
  finally { loading.value = false }
}
watch(() => route.fullPath, load, { immediate: true })
</script>

<template>
  <div class="detail-page"><div class="container">
    <button class="back-link" type="button" @click="router.back()">← 返回{{ config.title }}</button>
    <StatePanel v-if="loading" state="loading" />
    <StatePanel v-else-if="error" state="error" :message="error" @retry="load" />
    <article v-else-if="item" class="detail-article">
      <div class="detail-visual"><LazyImage :src="activeImage" :alt="item.title" eager /><div v-if="imageGallery.length > 1" class="thumbnail-strip"><button v-for="image in imageGallery" :key="image" :class="{ active: activeImage === image }" @click="activeImage = image"><LazyImage :src="image" :alt="`${item.title}预览`" /></button></div></div>
      <header class="detail-header"><span class="eyebrow">{{ config.title }} · ARCHIVE</span><h1>{{ item.title }}</h1><p>{{ item.description || item.summary }}</p><div v-if="tags.length" class="detail-tags"><span v-for="tag in tags" :key="tag">{{ tag }}</span></div></header>
      <section v-if="facts.length" class="detail-facts"><div v-for="fact in facts" :key="fact.label"><small>{{ fact.label }}</small><strong>{{ fact.value }}</strong></div></section>
      <section v-if="item.content" class="detail-content"><h2>内容说明</h2><SafeHtml class="rich-text" :content="item.content" /></section>
      <section v-if="item.downloadFiles?.length" class="download-panel"><div><span class="eyebrow">OPEN DOWNLOAD</span><h2>资源附件</h2><p>无需登录或申请，点击后直接下载。</p></div><div class="download-list"><a v-for="file in item.downloadFiles" :key="file.id" :href="downloadUrl(file.id)" download><span>{{ file.file_name }}</span><strong>直接下载 ↓</strong></a></div></section>
      <section v-if="related.length" class="related-section"><div class="section-heading"><div><span class="eyebrow">RELATED RESOURCES</span><h2>相关内容</h2></div></div><div class="archive-grid"><ResourceCard v-for="entry in related" :key="entry.id" :item="entry" :type="type" /></div></section>
    </article>
  </div></div>
</template>
