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
import { 
  AddElementCommand,
  RemoveElementCommand,
  ChangeTextCommand,
  ChangeTextPropertiesCommand,
  ChangeIconPropertiesCommand,
  MoveElementCommand,
  ResizeElementCommand
} from '@/utils/history';
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
    
    // Сохраняем начальное состояние (пустой холст)
    this.store.historyManager.saveInitialState(this.createSnapshot());
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
      if(this.currentEl){
        this.currentEl.deselect();
        return;
      }
      const positions = getElPosition({ evt, el: this.canvas });
      const newElId = String(Date.now());
      
      if (this.store.mode === 'text') {
        const elementData = {
          type: 'text',
          text: this.store.textarea,
          fontSize: this.store.fontSize,
          ...positions,
        };
        
        // Создаем команду и выполняем через менеджер истории
        const command = new AddElementCommand(newElId, elementData, this);
        this.store.historyManager.executeCommand(command);
        this.selectEl(newElId);
        return;
      }
    },
    
    addIconToCenter(selectedIcon: SelectedIcon) {
      if (!selectedIcon) return;

      const centerPositions = getCenterPosition({el: this.canvas})
      const newElId = String(Date.now());
      
      const elementData = {
        type: 'icon',
        iconName: selectedIcon.iconName,
        iconColor: this.store.iconColor,
        ...centerPositions,
      };
      
      // Создаем команду и выполняем через менеджер истории
      const command = new AddElementCommand(newElId, elementData, this);
      this.store.historyManager.executeCommand(command);
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
    
    updateSelectedTextFontSize(fontSize: number) {
      console.log('Updating font size to:', fontSize);
      if (this.currentEl && this.store.mode === 'text') {
        // Проверяем что это текстовый элемент
        if ('updateFontSize' in this.currentEl) {
          const oldFontSize = parseInt((this.currentEl as any).el.style.fontSize) || 16;
          if (oldFontSize !== fontSize) {
            const command = new ChangeTextPropertiesCommand(
              (this.currentEl as any).id,
              { fontSize: oldFontSize },
              { fontSize },
              this
            );
            this.store.historyManager.executeCommand(command);
          }
        }
      }
    },
    
    updateSelectedIconColor(color: string) {
      console.log('Updating icon color to:', color);
      if (this.currentEl && this.store.mode === 'icon') {
        // Проверяем что это иконка
        if ('updateColor' in this.currentEl) {
          const oldColor = (this.currentEl as any).svgContainer.style.color || '#333333';
          if (oldColor !== color) {
            const command = new ChangeIconPropertiesCommand(
              (this.currentEl as any).id,
              { color: oldColor },
              { color },
              this
            );
            this.store.historyManager.executeCommand(command);
          }
        }
      }
    },
    
    // Методы для работы с историей
    refreshDisplay() {
      console.log('Refreshing canvas display');
      // Обновляем отображение границ если есть выбранный элемент
      if (this.currentEl && this.sharedTextBorder) {
        this.currentEl.showBorders();
      }
    },
    
    resetToInitial() {
      console.log('Resetting canvas to initial state');
      const success = this.store.resetToInitial(this);
      if (success) {
        this.currentEl = null;
        this.sharedTextBorder?.hide();
      }
      return success;
    },
    
    // Методы для менеджера истории (будут использоваться командами)
    addElementById(elementId: string, elementData: any) {
      console.log('Adding element by id:', elementId, elementData);
      // Восстанавливаем элемент из данных
      if (elementData.type === 'text') {
        const div = new TextDiv({
          id: elementId,
          canvasEl: this.canvas,
          borders: this.sharedTextBorder!,
          text: elementData.text,
          fontSize: elementData.fontSize,
          inputFn: this.store.changeTextarea,
          selectEl: this.selectEl,
          onDragStart: this.onDragStart,
          onDragEnd: this.onDragEnd,
          onTextChanged: this.onTextChanged,
          onPropertiesChanged: this.onPropertiesChanged,
          onMoved: this.onMoved,
          onResized: this.onResized,
          xPos: elementData.xPos,
          yPos: elementData.yPos,
        });
        this.elements[elementId] = div;
        div.append();
      } else if (elementData.type === 'icon') {
        const iconDiv = new IconDiv({
          id: elementId,
          canvasEl: this.canvas,
          borders: this.sharedTextBorder!,
          iconName: elementData.iconName,
          iconColor: elementData.iconColor,
          selectEl: this.selectEl,
          onDragStart: this.onDragStart,
          onDragEnd: this.onDragEnd,
          onPropertiesChanged: this.onPropertiesChanged,
          onMoved: this.onMoved,
          onResized: this.onResized,
          xPos: elementData.xPos,
          yPos: elementData.yPos,
        });
        this.elements[elementId] = iconDiv;
        iconDiv.append();
      }
    },
    
    removeElementById(elementId: string) {
      console.log('Removing element by id:', elementId);
      const element = this.elements[elementId];
      if (element) {
        element.el.remove();
        delete this.elements[elementId];
        if (this.currentEl === element) {
          this.currentEl = null;
          this.sharedTextBorder?.hide();
        }
      }
    },
    
    // Создать снимок текущего состояния
    createSnapshot() {
      const snapshot = {
        elements: Object.keys(this.elements).map(id => {
          const element = this.elements[id];
          if ('text' in element) {
            // TextDiv
            return {
              id,
              type: 'text' as const,
              data: {
                text: (element as any).text,
                fontSize: 16, // можно будет улучшить когда добавим сохранение размера шрифта
                xPos: (element as any).xPos,
                yPos: (element as any).yPos,
              }
            };
          } else {
            // IconDiv
            return {
              id,
              type: 'icon' as const,
              data: {
                iconName: (element as any).iconName,
                iconColor: this.store.iconColor,
                xPos: (element as any).xPos,
                yPos: (element as any).yPos,
              }
            };
          }
        }),
        timestamp: Date.now(),
      };
      return snapshot;
    },
    
    // Загрузить снимок состояния
    loadSnapshot(snapshot: any) {
      console.log('Loading snapshot:', snapshot);
      // Очищаем текущие элементы
      Object.keys(this.elements).forEach(id => {
        this.removeElementById(id);
      });
      
      // Восстанавливаем элементы из снимка
      snapshot.elements.forEach((elementSnapshot: any) => {
        this.addElementById(elementSnapshot.id, elementSnapshot.data);
      });
    },
    
    // Методы для команд изменения свойств
    changeElementText(elementId: string, newText: string) {
      console.log('Changing element text:', elementId, newText);
      const element = this.elements[elementId];
      if (element && 'updateText' in element) {
        (element as any).updateText(newText);
      }
    },
    
    changeElementProperties(elementId: string, properties: any) {
      console.log('Changing element properties:', elementId, properties);
      const element = this.elements[elementId];
      if (!element) return;
      
      // Применяем изменения свойств
      if (properties.fontSize && 'updateFontSize' in element) {
        (element as any).updateFontSize(properties.fontSize);
      }
      
      if (properties.color && 'updateColor' in element) {
        (element as any).updateColor(properties.color);
      }
    },
    
    moveElement(elementId: string, position: { xPos: number; yPos: number }) {
      console.log('Moving element:', elementId, position);
      const element = this.elements[elementId];
      if (element) {
        (element as any).xPos = position.xPos;
        (element as any).yPos = position.yPos;
        element.el.style.left = `${position.xPos}px`;
        element.el.style.top = `${position.yPos}px`;
        
        // Обновляем границы если элемент выбран
        if (this.currentEl === element) {
          element.showBorders();
        }
      }
    },
    
    resizeElement(elementId: string, size: { width: number; height: number }) {
      console.log('Resizing element:', elementId, size);
      const element = this.elements[elementId];
      if (element) {
        (element as any).width = size.width;
        (element as any).height = size.height;
        element.el.style.width = `${size.width}px`;
        element.el.style.height = `${size.height}px`;
        
        // Обновляем границы если элемент выбран
        if (this.currentEl === element) {
          element.showBorders();
        }
      }
    },
    
    // Колбэки для отслеживания изменений элементов
    onTextChanged(elementId: string, oldText: string, newText: string) {
      console.log('Text changed:', elementId, oldText, '->', newText);
      const command = new ChangeTextCommand(elementId, oldText, newText, this);
      this.store.historyManager.executeCommand(command);
    },
    
    onPropertiesChanged(elementId: string, oldProps: any, newProps: any) {
      console.log('Properties changed:', elementId, oldProps, '->', newProps);
      const element = this.elements[elementId];
      if (!element) return;
      
      if ('text' in element) {
        // Текстовый элемент
        const command = new ChangeTextPropertiesCommand(elementId, oldProps, newProps, this);
        this.store.historyManager.executeCommand(command);
      } else {
        // Иконка
        const command = new ChangeIconPropertiesCommand(elementId, oldProps, newProps, this);
        this.store.historyManager.executeCommand(command);
      }
    },
    
    onMoved(elementId: string, oldPos: { xPos: number; yPos: number }, newPos: { xPos: number; yPos: number }) {
      console.log('Element moved:', elementId, oldPos, '->', newPos);
      const command = new MoveElementCommand(elementId, oldPos, newPos, this);
      this.store.historyManager.executeCommand(command);
    },
    
    onResized(elementId: string, oldSize: { width: number; height: number }, newSize: { width: number; height: number }) {
      console.log('Element resized:', elementId, oldSize, '->', newSize);
      const command = new ResizeElementCommand(elementId, oldSize, newSize, this);
      this.store.historyManager.executeCommand(command);
    },
    
    // Метод для удаления выбранного элемента
    deleteSelectedElement() {
      console.log('Deleting selected element');
      
      if (!this.currentEl) {
        console.log('No element selected for deletion');
        return false;
      }
      
      const elementId = (this.currentEl as any).id;
      const element = this.elements[elementId];
      
      if (!element) {
        console.log('Element not found in elements map');
        return false;
      }
      
      // Создаем данные элемента для возможности восстановления
      const elementData = this.createElementData(elementId, element);
      
      // Создаем и выполняем команду удаления
      const command = new RemoveElementCommand(elementId, elementData, this);
      this.store.historyManager.executeCommand(command);
      
      console.log('Element deleted:', elementId);
      return true;
    },
    
    // Создать данные элемента для команд истории
    createElementData(elementId: string, element: any) {
      if ('text' in element) {
        // Текстовый элемент
        return {
          type: 'text',
          text: element.text,
          fontSize: parseInt(element.el.style.fontSize) || 16,
          xPos: element.xPos,
          yPos: element.yPos,
        };
      } else {
        // Иконка
        return {
          type: 'icon',
          iconName: element.iconName,
          iconColor: element.svgContainer.style.color || '#333333',
          xPos: element.xPos,
          yPos: element.yPos,
        };
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
