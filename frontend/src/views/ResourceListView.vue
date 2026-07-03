<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategories, getContents, getTags } from '../api/content'
import { ApiError } from '../api/http'
import FilterPanel from '../components/content/FilterPanel.vue'
import ResourceCard from '../components/content/ResourceCard.vue'
import StatePanel from '../components/common/StatePanel.vue'
import { byType } from '../config/resources'
import type { Category, ContentItem, Paginated, ResourceType, Tag } from '../types/api'

const props = defineProps<{ type: ResourceType }>()
const route = useRoute(), router = useRouter(), config = computed(() => byType[props.type])
const result = ref<Paginated<ContentItem>>({ items: [], page: 1, pageSize: 12, total: 0, totalPages: 0 })
const categories = ref<Category[]>([]), tags = ref<Tag[]>([]), loading = ref(true), error = ref(''), filtersOpen = ref(false)
const text = ref('')
const arrayValue = (key: string) => { const value = route.query[key]; return (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean).map(String) }
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const categoryId = computed(() => route.query.categoryId ? Number(route.query.categoryId) : undefined)
const selectedTags = computed(() => arrayValue('tags'))
const extras = computed(() => ({ colors: arrayValue('colors'), crafts: arrayValue('crafts'), parts: arrayValue('parts'), meanings: arrayValue('meanings') }))
const activeCount = computed(() => (categoryId.value ? 1 : 0) + selectedTags.value.length + Object.values(extras.value).flat().length)

function setQuery(patch: Record<string, unknown>, resetPage = true) {
  const query = { ...route.query, ...patch }
  if (resetPage) delete query.page
  Object.keys(query).forEach(key => { if (query[key] === undefined || query[key] === '' || (Array.isArray(query[key]) && !(query[key] as unknown[]).length)) delete query[key] })
  router.replace({ query: query as never })
}
function toggleArray(key: string, value: string) { const values = arrayValue(key); setQuery({ [key]: values.includes(value) ? values.filter(v => v !== value) : [...values, value] }) }
function addExtra(key: string, value: string) { const clean = value.trim(); if (clean) toggleArray(key, clean) }
function clear() { text.value = ''; router.replace({ query: {} }) }
function submit() { setQuery({ keyword: text.value.trim() }) }
async function load() {
  loading.value = true; error.value = ''
  try {
    result.value = await getContents(props.type, { page: page.value, pageSize: 12, keyword: String(route.query.keyword || ''), categoryId: categoryId.value, tags: selectedTags.value, sort: (route.query.sort as 'default') || 'default', ...(props.type === 'pattern' ? extras.value : {}) })
  } catch (e) { error.value = e instanceof ApiError ? e.message : '资源加载失败' }
  finally { loading.value = false }
}
onMounted(async () => {
  const [cats, allTags] = await Promise.allSettled([getCategories(props.type), getTags()])
  if (cats.status === 'fulfilled') categories.value = cats.value.items
  if (allTags.status === 'fulfilled') tags.value = allTags.value.items
})
watch(() => route.fullPath, () => { text.value = String(route.query.keyword || ''); load() }, { immediate: true })
</script>

<template>
  <div class="archive-page" :class="`archive-page--${type}`">
    <header class="archive-hero"><div class="container"><span class="eyebrow">OPEN DIGITAL ARCHIVE</span><h1>{{ config.title }}</h1><p>{{ config.intro }}</p></div></header>
    <div class="container archive-shell">
      <form class="archive-search" role="search" @submit.prevent="submit"><label class="sr-only" for="archive-keyword">关键词</label><input id="archive-keyword" v-model="text" placeholder="搜索标题或内容简介" /><button type="submit">检索</button></form>
      <button class="filter-toggle" type="button" :aria-expanded="filtersOpen" @click="filtersOpen = !filtersOpen">筛选条件 <span v-if="activeCount">{{ activeCount }}</span></button>
      <div class="archive-layout">
        <FilterPanel :class="{ mobileOpen: filtersOpen }" :pattern="type === 'pattern'" :categories="categories" :tags="tags" :category-id="categoryId" :selected-tags="selectedTags" :extras="extras" @category="value => setQuery({ categoryId: value })" @tag="value => toggleArray('tags', value)" @extra="addExtra" @clear="clear" />
        <section class="archive-results" aria-live="polite">
          <div class="result-toolbar"><p>共 <strong>{{ result.total }}</strong> 项已上架资源</p><label>排序<select :value="route.query.sort || 'default'" @change="setQuery({ sort: ($event.target as HTMLSelectElement).value })"><option value="default">综合排序</option><option value="latest">最新发布</option><option value="popular">最多浏览</option><option value="downloads">最多下载</option></select></label></div>
          <StatePanel v-if="loading" state="loading" />
          <StatePanel v-else-if="error" state="error" :message="error" @retry="load" />
          <StatePanel v-else-if="!result.items.length" state="empty" message="没有找到符合条件的已上架资源，请调整筛选条件。" />
          <div v-else class="archive-grid" :class="{ portraits: config.portrait }"><ResourceCard v-for="item in result.items" :key="item.id" :item="item" :type="type" :portrait="config.portrait" :category="categories.find(c => c.id === item.category_id)?.name" /></div>
          <nav v-if="!loading && result.totalPages > 1" class="pagination" aria-label="分页"><button :disabled="page <= 1" @click="setQuery({ page: page - 1 }, false)">上一页</button><span>第 {{ page }} / {{ result.totalPages }} 页</span><button :disabled="page >= result.totalPages" @click="setQuery({ page: page + 1 }, false)">下一页</button></nav>
        </section>
      </div>
    </div>
  </div>
</template>
