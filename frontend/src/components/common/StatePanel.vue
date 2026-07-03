<script setup lang="ts">
defineProps<{ state: 'loading' | 'empty' | 'error'; message?: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="state-panel" :class="`is-${state}`" role="status" aria-live="polite">
    <span v-if="state === 'loading'" class="state-spinner" aria-hidden="true"></span>
    <span v-else class="state-mark" aria-hidden="true">{{ state === 'empty' ? '◇' : '!' }}</span>
    <p>{{ message || (state === 'loading' ? '正在读取内容…' : state === 'empty' ? '暂无已上架内容' : '内容加载失败') }}</p>
    <button v-if="state === 'error'" class="text-button" type="button" @click="$emit('retry')">重新加载</button>
  </div>
</template>
