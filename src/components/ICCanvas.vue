<template>
  <div ref="canvasBody" :class="$style.body" data-canvas-area="body" @click="handleDeselect">
    <div
      ref="canvas"
      :class="[$style.canvas, store.mode === 'text' && $style.modeText]"
      :style="canvasBg"
      data-canvas-area="canvas"
      @click="addElement"
    />
  </div>
</template>

<script lang="ts">
import { useInfoConstructor } from '@/stores/InfoConstructor';
import { downloadAsImage } from '@/utils/extract-image';
import { TextDiv } from '@/utils/text';
import { IconDiv } from '@/utils/icons';
import { getElPosition, getCenterPosition } from '@/utils/position';
import { Borders } from '@/utils/borders';
import type { SelectedIcon } from './types';
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
    elements: {} as Record<string, TextDiv | IconDiv>,
    currentEl: null as null | TextDiv | IconDiv,
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
      if (this.currentEl && document.activeElement !== this.currentEl.el && this.store.mode === "text") {
        (this.currentEl as any).updateText(text);
      }
    },
  },
  mounted() {
    this.sharedTextBorder = new Borders({ canvasEl: this.canvas });
    this.throttledOnMouseMove = throttle(this.onMouseMove, 20);
    this.canvas.addEventListener('mousemove', this.throttledOnMouseMove);
    document.addEventListener('mouseup', this.cancelResize);
  },
  onBeforeUnmount() {
    this.canvas.removeEventListener('mousemove', this.throttledOnMouseMove);
  },
  methods: {
    cancelResize() {
      if (!this.sharedTextBorder || !this.currentEl) {
        return;
      }
      this.currentEl.xDragStartPos = null;
      this.currentEl.yDragStartPos = null;
      this.sharedTextBorder.cancelResize();
    },
    handleDeselect(evt: MouseEvent) {
      console.log('handleDeselect', evt.target);
      
      const target = evt.target as HTMLElement;
      const canvasArea = target?.dataset?.canvasArea;
      
      console.log('canvasArea:', canvasArea);
      console.log('target:', target);
      
      // Проверяем кликнули ли по области холста (body или canvas), но не по элементам
      if (canvasArea === 'body' || canvasArea === 'canvas') {
        console.log('handleDeselect: clicked on canvas area');
        evt.stopImmediatePropagation();
        
        if (this.currentEl) {
          console.log('handleDeselect: deselecting current element');
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
      if(this.store.mode === "text"){
        this.store.changeTextarea((this.currentEl as any).text);
      }
    },
    addElement(evt: MouseEvent) {
      if (this.isDragging || this.isResizing || !this.sharedTextBorder) {
        return;
      }
      const positions = getElPosition({ evt, el: this.canvas });
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
    
    addIconToCenter(selectedIcon: SelectedIcon) {
      if (!selectedIcon) return;

      const centerPositions = getCenterPosition({el: this.canvas})
      const newElId = String(Date.now());
      
      const iconDiv = new IconDiv({
        id: newElId,
        canvasEl: this.canvas,
        borders: this.sharedTextBorder,
        iconName: selectedIcon.iconName,
        selectEl: this.selectEl,
        onDragStart: this.onDragStart,
        onDragEnd: this.onDragEnd,
        ...centerPositions,
      });


      this.elements[newElId] = iconDiv;
      iconDiv.append();
      this.selectEl(newElId);
      
      console.log('Icon added to center:', selectedIcon);
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
<style src="./divIcon.css" />
<style src="./borders.css" />
