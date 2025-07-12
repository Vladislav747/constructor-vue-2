<script setup lang="ts">
import ICCanvas from './ICCanvas.vue';
import ICControls from './ICControls.vue';

</script>

<template>
  <div :class="$style.wrapper">
    <ICControls />
    <ICCanvas />
  </div>
</template>

<style module>
.wrapper {
  display: flex;
  width: 100%;
  gap: 32px;
}
</style>