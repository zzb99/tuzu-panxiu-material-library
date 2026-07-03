<script setup lang="ts">
import { RouterView } from 'vue-router'
import SiteFooter from './components/layout/SiteFooter.vue'
import SiteHeader from './components/layout/SiteHeader.vue'
</script>

<template>
  <a class="skip-link" href="#main-content">跳至主要内容</a>
  <SiteHeader />
  <main id="main-content"><RouterView /></main>
  <SiteFooter />
</template>
