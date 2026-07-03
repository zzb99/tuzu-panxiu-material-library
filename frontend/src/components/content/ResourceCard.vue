<script setup lang="ts">
import { computed } from 'vue'
import LazyImage from '../common/LazyImage.vue'
import type { ContentItem, ResourceType } from '../../types/api'
import { byType } from '../../config/resources'

const props = defineProps<{ item: ContentItem; type: ResourceType; category?: string; portrait?: boolean }>()
const tags = computed(() => {
  if (Array.isArray(props.item.tags)) return props.item.tags
  if (typeof props.item.tags !== 'string') return []
  try { const parsed = JSON.parse(props.item.tags); if (Array.isArray(parsed)) return parsed }
  catch { /* space-separated API fallback */ }
  return props.item.tags.split(/\s+/).filter(Boolean)
})
const image = computed(() => props.item.cover_image || props.item.image_url)
</script>

<template>
  <RouterLink class="archive-card" :class="{ portrait }" :to="`/${byType[type].path}/${item.id}`">
    <LazyImage :src="image" :alt="item.title" />
    <div class="archive-card__body">
      <div class="archive-card__meta"><span>{{ category || byType[type].title }}</span><span v-if="item.download_count">下载 {{ item.download_count }}</span></div>
      <h2>{{ item.title }}</h2>
      <p>{{ item.description || '查看资源详情与完整说明' }}</p>
      <div v-if="tags.length" class="archive-card__tags"><span v-for="tag in tags.slice(0, 3)" :key="tag">{{ tag }}</span></div>
      <span class="archive-card__arrow" aria-hidden="true">↗</span>
    </div>
  </RouterLink>
</template>
