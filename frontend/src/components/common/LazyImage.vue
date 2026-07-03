<script setup lang="ts">
import { ref } from 'vue'
import { resolveAssetUrl } from '../../api/http'

defineProps<{ src?: string | null; alt: string; eager?: boolean }>()
const failed = ref(false)
</script>

<template>
  <div class="lazy-image" :class="{ 'is-empty': !src || failed }">
    <img v-if="src && !failed" :src="resolveAssetUrl(src)" :alt="alt" :loading="eager ? 'eager' : 'lazy'" decoding="async" @error="failed = true" />
    <div v-else class="image-placeholder" aria-hidden="true"><span></span></div>
  </div>
</template>
