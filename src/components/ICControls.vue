<template>
  <div :class="$style.body">
    controls
    <button @click="whenDownloadAsAnImage()">downloadHtmlAsImage</button>
    <button @click="setImage('/img/perfect-3x4.jpg')">perfect-3x4.jpg</button>
    <button @click="setImage('/img/wide-greybg-macbook.jpg')">wide-greybg-macbook.jpg</button>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    setImage: {
      type: Function,
      required: true,
    },
    whenDownloadAsAnImage: {
      type: Function,
      required: true,
    }
  }
}
</script>

<style module>
.body {
  border: 4px solid #ABBCD51F;
  border-radius: 4px;
}
</style>