<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; description?: string; to?: string }>()
</script>

<template>
  <header class="section-heading">
    <div><span class="eyebrow">{{ eyebrow }}</span><h2>{{ title }}</h2><p v-if="description">{{ description }}</p></div>
    <RouterLink v-if="to" :to="to" class="more-link">查看全部 <span aria-hidden="true">↗</span></RouterLink>
  </header>
</template>
