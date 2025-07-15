<template>
  <div :class="$style.body">
    controls
    <button @click="whenDownloadAsAnImage()">
      download
    </button>
    <br>
    <br>
    <button @click="setImage('/img/perfect-3x4.jpg')">
      perfect-3x4
    </button>
    <button @click="setImage('/img/wide-greybg-macbook.jpg')">
      wide-greybg-macbook
    </button>
    <button @click="setImage('/img/narrow-macbook.jpg')">
      narrow-macbook
    </button>

    <TextControls />
  </div>
</template>

<script lang="ts">
import TextControls from './TextControls.vue';

export default {
  components: {
    TextControls,
  },
  props: {
    setImage: {
      type: Function,
      required: true,
    },
    whenDownloadAsAnImage: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style module>
.body {
  border: 4px solid #ABBCD51F;
  border-radius: 4px;
}
</style>
