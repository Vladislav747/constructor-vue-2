<template>
  <div ref="canvasBody" :class="$style.body" @click="handleDeselect">
    <div
      ref="canvas"
      :class="[$style.canvas, store.mode === 'text' && $style.modeText]"
      :style="canvasBg"
      @click="addTextEl"
    />
  </div>
</template>

<script lang="ts">
import { useInfoConstructor } from '@/stores/InfoConstructor';
import { downloadAsImage } from '@/utils/extract-image';
import { TextDiv } from '@/utils/text';
import { getCanvasPosition } from '@/utils/position';
import { Borders } from '@/utils/borders';
import throttle from 'lodash/throttle';

export default {
  props: {
    imgUrl: {
      type: String,
      default: '',
      required: true,
    },
  },
  data: () => ({
    store: useInfoConstructor(),
    sharedTextBorder: null as null | Borders,
    elements: {} as Record<string, TextDiv>,
    currentEl: null as null | TextDiv,
    isDragging: false,
    throttledOnMouseMove: (evt: MouseEvent) => {},
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
    },
    isResizing(): boolean {
      return this.sharedTextBorder?.isResize || false;
    },
  },
  watch: {
    'store.textarea'(text: string) {
      if (this.currentEl && document.activeElement !== this.currentEl.el) {
        this.currentEl.updateText(text);
      }
    },
  },
  mounted() {
    this.sharedTextBorder = new Borders({ canvasEl: this.canvas });
    this.throttledOnMouseMove = throttle(this.onMouseMove, 20);
    this.canvas.addEventListener('mousemove', this.throttledOnMouseMove);
    document.addEventListener('mouseup', this.sharedTextBorder.cancelResize);
  },
  onBeforeUnmount() {
    this.canvas.removeEventListener('mousemove', this.throttledOnMouseMove);
  },
  methods: {
    handleDeselect(evt: MouseEvent) {
      if (evt.target === this.canvasBody) {
        evt.stopImmediatePropagation();
        if (this.currentEl) {
          this.currentEl.deselect();
          this.sharedTextBorder?.hide();
        }
        this.currentEl = null;
      }
    },
    onMouseMove(evt: MouseEvent) {
      if (!this.currentEl) {
        return;
      }
      if (this.isDragging) {
        this.currentEl.moveEl(evt);
      }
      if (this.isResizing) {
        this.currentEl.resize(evt);
      }
    },
    selectEl(id: string) {
      if (this.currentEl) {
        this.currentEl.deselect();
      }
      this.currentEl = this.elements[id];
      this.store.changeTextarea(this.currentEl.text);
    },
    addTextEl(evt: MouseEvent) {
      if (this.isDragging || this.isResizing || !this.sharedTextBorder) {
        return;
      }
      const positions = getCanvasPosition({
        event: evt,
        canvasEl: this.canvas,
      });
      const newElId = String(Date.now());
      if (this.store.mode === 'text') {
        const div = new TextDiv({
          id: newElId,
          canvasEl: this.canvas,
          borders: this.sharedTextBorder,
          text: this.store.textarea,
          inputFn: this.store.changeTextarea,
          selectEl: this.selectEl,
          onDragStart: this.onDragStart,
          onDragEnd: this.onDragEnd,
          ...positions,
        });
        this.elements[newElId] = div;
        div.append();
        this.selectEl(newElId);
        return;
      }
    },
    onDragStart() {
      this.isDragging = true;
    },
    onDragEnd() {
      this.isDragging = false;
    },
    downloadAsImage() {
      if (this.canvasBody) {
        downloadAsImage(this.canvasBody);
      }
    },
  },
};
</script>

<style module>
.body {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  height: 666px;
  padding: 24px;
  background-color: #9bb7e212;
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

<style src="./divText.css" />
<style src="./borders.css" />
