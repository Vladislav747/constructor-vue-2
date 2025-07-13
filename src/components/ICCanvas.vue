<template>
  <div :class="$style.body" ref="canvasBody">
    <div :class="[
      $style.canvas,
      store.mode === 'text' && $style.modeText
    ]" :style="canvasBg">

    </div>
  </div>
</template>

<script lang="ts">
import { useCounterStore } from '@/stores/InfoConstructor'
import { downloadAsImage } from '@/utils/extract-image';

export default {
  props: {
    imgUrl: {
      type: String,
      default: '',
      required: true,
    }
  },
  data: () => ({
    store: useCounterStore()
  }),
  computed: {
    canvasBg() {
      return this.imgUrl ? { backgroundImage: `url('${this.imgUrl}')` } : undefined;
    }
  },
  methods: {
    downloadAsImage() {
      const canvasBody = this.$refs.canvasBody as HTMLElement;
      if (canvasBody) {
        downloadAsImage(canvasBody)
      }
    }
  }
}
</script>

<style module>
.body {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  height: 666px;
  padding: 24px;
  background-color: #9BB7E212;
}

.canvas {
  width: 464px;
  height: 618px;
  outline: 1px solid red;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: top center;
}

.canvas.modeText {
  cursor: text;
}
</style>