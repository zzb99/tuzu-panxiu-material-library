<script setup lang="ts">
import type { ContentItem } from '../../types/api'
import LazyImage from '../common/LazyImage.vue'
import SectionHeading from '../common/SectionHeading.vue'
import StatePanel from '../common/StatePanel.vue'

defineProps<{
  eyebrow: string; title: string; description: string; to: string; items: ContentItem[]
  loading?: boolean; error?: string; variant?: 'grid' | 'feature' | 'list' | 'portrait'
}>()
defineEmits<{ retry: [] }>()

function tagsOf(value: ContentItem['tags']): string[] {
  if (Array.isArray(value)) return value.slice(0, 2)
  if (typeof value !== 'string') return []
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.slice(0, 2) : [] }
  catch { return value.split(/\s+/).filter(Boolean).slice(0, 2) }
}
</script>

<template>
  <section class="content-section" :class="`section-${variant || 'grid'}`">
    <div class="container">
      <SectionHeading :eyebrow="eyebrow" :title="title" :description="description" :to="to" />
      <StatePanel v-if="loading" state="loading" />
      <StatePanel v-else-if="error" state="error" :message="error" @retry="$emit('retry')" />
      <StatePanel v-else-if="!items.length" state="empty" />
      <div v-else class="resource-grid">
        <RouterLink v-for="item in items" :key="item.id" :to="`${to}/${item.id}`" class="resource-card">
          <LazyImage :src="item.cover_image || item.image_url" :alt="item.title" />
          <div class="resource-card__body">
            <div v-if="tagsOf(item.tags).length" class="tag-row"><span v-for="tag in tagsOf(item.tags)" :key="tag">{{ tag }}</span></div>
            <h3>{{ item.title }}</h3>
            <p v-if="item.description">{{ item.description }}</p>
            <span class="card-arrow" aria-hidden="true">↗</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
