<script setup lang="ts">
import PageHeader from './components/other/PageHeader.vue';
</script>

<template>
  <div id="app">
    <div :class="$style.container">
      <PageHeader />
      <router-view />
    </div>
  </div>
</template>

<style module>
.container {
  padding: 0 16px;
}
</style>
