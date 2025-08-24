import { Component, VNode, vueComponent } from '@ozon-sx/vue-component-base/v2';
import { TextDiv } from './TextDiv'; // предполагаемый импорт
import { getElPosition, downloadAsImage } from '../utils'; // предполагаемые импорты
import { DeleteHandler } from './DeleteHandler';
import { Dropdown, DropdownItem } from '@fe/ods';
import styles from './index.css?module';

@Component
export class CanvasComponent extends vueComponent({}) {
  // Объявляем в data() для правильной реактивности
  data() {
    return {
      elements: {} as Record<string, any>,
      currentEl: null as any,
      isDragging: false,
      showContextMenu: false,
      contextMenuPos: { left: 0, top: 0 }
    };
  }
  
  private sharedTextBorder: any = null; // тип зависит от вашей реализации

  // Геттеры для store (предполагаемые)
  get imageCanvasStore(): any {
    // Ваша реализация store
    return this.$store.imageCanvas;
  }

  get canvasBg(): any {
    // Ваша реализация фона канваса
    return {};
  }

  handleClickOutside(): void {
    if (this.showContextMenu) {
      this.showContextMenu = false;
    }
  }

  handleDeselect(): void {
    if (this.currentEl) {
      this.currentEl.deselect();
      this.currentEl = null;
    }
  }

  selectEl = (id: string): void => {
    console.log('=== SELECT ELEMENT ===');
    console.log('Selecting ID:', id);
    console.log('Available elements:', Object.keys(this.elements));
    
    if (this.currentEl) {
      console.log('Deselecting current element:', this.currentEl.id);
      if (this.currentEl.deselect && typeof this.currentEl.deselect === 'function') {
        this.currentEl.deselect();
      }
    }
    
    this.currentEl = this.elements[id];
    
    if (!this.currentEl) {
      console.log('ERROR: Element not found for ID:', id);
      return;
    }
    
    console.log('Selected element:', this.currentEl);
    console.log('Element has deselect method:', typeof this.currentEl.deselect === 'function');
    
    if (this.currentEl && this.currentEl.text !== undefined) {
      this.imageCanvasStore.mutations.changeTextarea(this.currentEl.text);
    }
  };

  addTextEl = (evt: MouseEvent): void => {
    if (this.isDragging || !this.sharedTextBorder) {
      console.log('Cannot add text element:', { isDragging: this.isDragging, hasSharedTextBorder: !!this.sharedTextBorder });
      return;
    }

    const positions = getElPosition({
      event: evt,
      canvasEl: this.$refs.canvas!,
    });

    const newElId = String(Date.now());
    
    if (this.imageCanvasStore.state.mode === 'text' && this.$refs.canvas) {
      console.log('Creating new text element with ID:', newElId);
      
      const divEl = new TextDiv({
        id: newElId,
        canvasEl: this.$refs.canvas,
        borders: this.sharedTextBorder,
        text: this.imageCanvasStore.state.text,
        inputFn: this.imageCanvasStore.mutations.changeTextarea,
        selectEl: this.selectEl,
        onDragStart: this.onDragStart,
        onDragEnd: this.onDragEnd,
        ...positions,
      });

      // Используем $set для реактивного добавления
      this.$set(this.elements, newElId, divEl);
      
      console.log('Added element using $set:', newElId);
      console.log('Elements count after add:', Object.keys(this.elements).length);
      console.log('Element keys:', Object.keys(this.elements));
      
      divEl.append();
      this.selectEl(newElId);
    } else {
      console.log('Cannot create element:', {
        mode: this.imageCanvasStore.state.mode,
        hasCanvas: !!this.$refs.canvas
      });
    }
  };

  onDragStart = (): void => {
    this.isDragging = true;
    console.log('Drag started');
  };

  onDragEnd = (): void => {
    this.isDragging = false;
    console.log('Drag ended');
  };

  downloadAsImage(): void {
    if (this.$refs.canvasBody) {
      downloadAsImage(this.$refs.canvasBody);
    }
  }

  onDeleteElement = (keyPressed: string): void => {
    console.log('=== DELETE ELEMENT START ===');
    console.log('Key pressed:', keyPressed);
    console.log('Current element:', this.currentEl);
    console.log('Elements count before delete:', Object.keys(this.elements).length);
    console.log('Element keys before delete:', Object.keys(this.elements));
    
    if (!this.currentEl) {
      console.log('No current element selected');
      return;
    }

    const elementId = this.currentEl.id;
    console.log('Element ID to delete:', elementId);
    
    const element = this.elements[elementId];
    console.log('Element found in object:', !!element);
    
    if (!element) {
      console.log('Element not found in object');
      console.log('Available elements:', Object.keys(this.elements));
      return;
    }

    // Удаляем DOM элемент (если есть метод remove)
    if (element.remove && typeof element.remove === 'function') {
      element.remove();
      console.log('DOM element removed');
    } else if (element.destroy && typeof element.destroy === 'function') {
      element.destroy();
      console.log('DOM element destroyed');
    }

    // Используем $delete для реактивного удаления
    this.$delete(this.elements, elementId);
    console.log('Element deleted using $delete');
    
    // Сбрасываем текущий элемент
    this.currentEl = null;
    
    console.log('Elements count after delete:', Object.keys(this.elements).length);
    console.log('Element keys after delete:', Object.keys(this.elements));
    console.log('=== DELETE ELEMENT END ===');
  };

  // Дополнительные методы для отладки
  getAllElements(): any[] {
    return Object.values(this.elements);
  }

  getElementsCount(): number {
    return Object.keys(this.elements).length;
  }

  clearAllElements(): void {
    console.log('Clearing all elements');
    
    // Удаляем все DOM элементы
    Object.entries(this.elements).forEach(([id, element]) => {
      if (element.remove && typeof element.remove === 'function') {
        element.remove();
      } else if (element.destroy && typeof element.destroy === 'function') {
        element.destroy();
      }
      console.log('Removed element:', id);
    });
    
    // Очищаем объект
    Object.keys(this.elements).forEach(key => {
      delete this.elements[key];
    });
    
    this.currentEl = null;
    
    console.log('All elements cleared. Elements count:', this.getElementsCount());
  }

  // Отладочные методы для консоли
  debugElements(): void {
    console.log('=== ELEMENTS DEBUG ===');
    console.log('Elements count:', this.getElementsCount());
    console.log('Current element:', this.currentEl);
    console.log('All element IDs:', Object.keys(this.elements));
    
    Object.entries(this.elements).forEach(([id, element]) => {
      console.log(`Element ${id}:`, {
        hasRemoveMethod: typeof element.remove === 'function',
        hasDeselectMethod: typeof element.deselect === 'function',
        text: element.text,
        id: element.id
      });
    });
    console.log('=== ELEMENTS DEBUG END ===');
  }

  mounted(): void {
    // Добавляем отладочные методы в window для тестирования
    if (process.env.NODE_ENV === 'development') {
      (window as any).debugCanvas = {
        elements: () => this.debugElements(),
        clear: () => this.clearAllElements(),
        count: () => this.getElementsCount(),
        current: () => this.currentEl
      };
      console.log('Debug methods added to window.debugCanvas');
    }
  }

  render(): VNode {
    return (
      <div class={styles.root}>
        <div
          ref='canvasBody'
          class={styles.body}
          onClick={this.handleDeselect}
          v-test-id='image-canvas/canvas_body'
        >
          <div
            ref='canvas'
            class={{
              [styles.canvas]: true,
              [styles.modeText]: this.imageCanvasStore.getters.currentMode === 'text'
            }}
            style={this.canvasBg}
            onClick={this.addTextEl}
          />
        </div>
        
        {this.showContextMenu && (
          <Dropdown
            class={styles.dropdown}
            style={{
              left: `${this.contextMenuPos.left}px`,
              top: `${this.contextMenuPos.top}px`
            }}
          >
            <DropdownItem label={this.$tr('Удалить')} />
          </Dropdown>
        )}
        
        <DeleteHandler whenDeleteEl={this.onDeleteElement} />
        
        {/* Отладочная информация в development режиме */}
        {process.env.NODE_ENV === 'development' && (
          <div class={styles.debugInfo}>
            <p>Elements count: {this.getElementsCount()}</p>
            <p>Current element: {this.currentEl?.id || 'none'}</p>
            <p>Is dragging: {this.isDragging ? 'yes' : 'no'}</p>
          </div>
        )}
      </div>
    );
  }
}
