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
import { useInfoConstructor } from '@/stores/InfoConstructor'
import { downloadAsImage } from '@/utils/extract-image';
import { TextDiv } from '@/utils/text';
import { getCanvasPosition } from '@/utils/position';
import { Borders } from '@/utils/borders';

export default {
  props: {
    imgUrl: {
      type: String,
      default: '',
      required: true,
    }
  },
  data: () => ({
    store: useInfoConstructor(),
    sharedTextBorder: null as null | Borders
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
    this.sharedTextBorder = new Borders({ canvasEl: this.canvas });
    this.canvas.addEventListener('click', this.addTextEl)
  },
  methods: {
    addTextEl(evt: MouseEvent) {
      if (!this.sharedTextBorder) {
        return;
      }
      const positions = getCanvasPosition({
        event: evt,
        canvasEl: this.canvas,
      });
      const div = new TextDiv({
        canvasEl: this.canvas,
        borders: this.sharedTextBorder,
        text: this.store.textarea,
        inputFn: this.store.changeTextarea,
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
  cursor: default;
}

.divText:focus {
  outline: transparent;
}

.elementBorders {
  position: absolute;
  display: none;
  border: 2px solid blue;
  pointer-events: none;
  z-index: 9000;
}
</style>