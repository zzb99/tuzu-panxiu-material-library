<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 4 })
</script>
<template><div class="loading-state" aria-label="正在加载"><el-skeleton animated :rows="rows"/></div></template>
