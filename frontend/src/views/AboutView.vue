<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getPage } from '../api/content'
import { ApiError } from '../api/http'
import StatePanel from '../components/common/StatePanel.vue'
import SafeHtml from '../components/common/SafeHtml.vue'
import type { PageContent } from '../types/api'
const page = ref<PageContent | null>(null), loading = ref(true), error = ref('')
async function load() { loading.value = true; error.value = ''; try { page.value = await getPage('about') } catch (e) { error.value = e instanceof ApiError ? e.message : '页面加载失败' } finally { loading.value = false } }
onMounted(load)
</script>
<template><div class="about-page"><StatePanel v-if="loading" state="loading" /><StatePanel v-else-if="error" state="error" :message="error" @retry="load" /><article v-else-if="page"><header class="about-hero"><div class="about-overlay"></div><div class="container"><span class="eyebrow light">ABOUT THE ARCHIVE</span><h1>{{ page.title }}</h1><p>{{ page.description }}</p></div></header><section class="container about-content"><span class="eyebrow">PLATFORM STATEMENT</span><h2>开放、清晰、可持续的数字文化资源</h2><SafeHtml v-if="page.content" class="rich-text" :content="page.content" /></section></article></div></template>
