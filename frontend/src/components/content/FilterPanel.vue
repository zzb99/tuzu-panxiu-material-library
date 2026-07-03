<script setup lang="ts">
import type { Category, Tag } from '../../types/api'

defineProps<{ pattern: boolean; categories: Category[]; tags: Tag[]; categoryId?: number; selectedTags: string[]; extras: Record<string, string[]> }>()
const emit = defineEmits<{ category: [number | undefined]; tag: [string]; extra: [string, string]; clear: [] }>()
</script>

<template>
  <aside class="filter-panel" aria-label="资源筛选">
    <div class="filter-heading"><strong>筛选资源</strong><button type="button" @click="emit('clear')">全部清空</button></div>
    <fieldset v-if="categories.length"><legend>分类</legend><div class="filter-options">
      <button type="button" :class="{ active: !categoryId }" @click="emit('category', undefined)">全部</button>
      <button v-for="item in categories" :key="item.id" type="button" :class="{ active: categoryId === item.id }" @click="emit('category', categoryId === item.id ? undefined : item.id)">{{ item.name }}</button>
    </div></fieldset>
    <fieldset v-if="tags.length"><legend>标签</legend><div class="filter-options">
      <button v-for="item in tags" :key="item.id" type="button" :class="{ active: selectedTags.includes(item.name) }" @click="emit('tag', item.name)">{{ item.name }}</button>
    </div></fieldset>
    <template v-if="pattern">
      <fieldset v-for="(label, key) in { colors: '色彩', crafts: '工艺', parts: '应用部位', meanings: '寓意' }" :key="key">
        <legend>{{ label }}</legend>
        <form class="filter-input" @submit.prevent="($event.currentTarget as HTMLFormElement).querySelector('input') && emit('extra', key, (($event.currentTarget as HTMLFormElement).querySelector('input') as HTMLInputElement).value)">
          <input :placeholder="`输入${label}后回车`" :aria-label="label" /><button type="submit">添加</button>
        </form>
        <div v-if="extras[key]?.length" class="filter-options"><button v-for="value in extras[key]" :key="value" class="active" type="button" @click="emit('extra', key, value)">{{ value }} ×</button></div>
      </fieldset>
    </template>
  </aside>
</template>
