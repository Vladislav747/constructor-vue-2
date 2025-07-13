<template>
  <div :class="$style.body" ref="canvasBody">
    <div :class="[
      $style.canvas,
      store.mode === 'text' && $style.modeText
    ]" :style="canvasBg" ref="canvas">

    </div>
  </div>
</template>

<script lang="ts">
import { useCounterStore } from '@/stores/InfoConstructor'
import { downloadAsImage } from '@/utils/extract-image';
import { TextDiv } from '@/utils/text';
import { getCanvasPosition } from '@/utils/position';

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
    },
    canvas(): HTMLDivElement {
      return this.$refs.canvas as HTMLDivElement;
    },
    canvasBody(): HTMLDivElement {
      return this.$refs.canvasBody as HTMLDivElement;
    }
  },
  mounted() {
    this.canvas.addEventListener('click', this.addTextEl)
  },
  methods: {
    addTextEl(evt: MouseEvent) {
      const positions = getCanvasPosition(evt, this.canvas)
      console.log(positions);
      const div = new TextDiv({
        canvas: this.canvas,
        text: this.store.textarea,
        ...positions,
      });
      div.append();

    },
    downloadAsImage() {
      if (this.canvasBody) {
        downloadAsImage(this.canvasBody)
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
  position: relative;
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

<style>
.divText {
  position: absolute;
  display: inline-block;
  padding: 8px;
  word-break: break-all;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}
</style>