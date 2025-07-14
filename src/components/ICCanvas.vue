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
    sharedTextBorder: null as null | Borders,
    elements: {} as Record<string, TextDiv>,
    currentEl: null as null | TextDiv,
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
    selectEl(id: string) {
      if (this.currentEl) {
        this.currentEl.isSelected = false;
      }
      this.currentEl = this.elements[id];
      this.store.changeTextarea(this.currentEl.text)
    },
    addTextEl(evt: MouseEvent) {
      if (!this.sharedTextBorder) {
        return;
      }
      const positions = getCanvasPosition({
        event: evt,
        canvasEl: this.canvas,
      });
      const newElId = String(Date.now());
      const div = new TextDiv({
        id: newElId,
        canvasEl: this.canvas,
        borders: this.sharedTextBorder,
        text: this.store.textarea,
        inputFn: this.store.changeTextarea,
        selectEl: this.selectEl,
        ...positions,
      });
      this.elements[newElId] = div;
      div.append();
      this.selectEl(newElId);
    },
    downloadAsImage() {
      if (this.canvasBody) {
        downloadAsImage(this.canvasBody)
      }
    }
  },
  watch: {
    'store.textarea'(text: string) {
      if (this.currentEl && document.activeElement !== this.currentEl.el) {
        this.currentEl.outerUpdateText(text);
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