import { getElPosition } from '@/utils/position';
import { Borders } from './borders';

const DRAG_THRESHOLD = 5;

const getDragThreshold = (): number => {
  // Высокие DPI
  if (window.devicePixelRatio > 2) {
    return 8;
  }
  
  // Стандартные устройства
  return 5;
};

export type TextDivProperties = {
  id: string;
  canvasEl: HTMLDivElement;
  borders: Borders;
  text: string;
  xPos: number;
  yPos: number;
  fontSize?: number;
  inputFn: (value: string) => void;
  selectEl: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  onTextChanged?: (elementId: string, oldText: string, newText: string) => void;
  onPropertiesChanged?: (elementId: string, oldProps: any, newProps: any) => void;
  onMoved?: (elementId: string, oldPos: { xPos: number; yPos: number }, newPos: { xPos: number; yPos: number }) => void;
  onResized?: (elementId: string, oldSize: { width: number; height: number }, newSize: { width: number; height: number }) => void;
};

/** TODO: redo in "left" and "top" properties
 *  to "transform: translate(xPos: px, yPos: px)"
 *
 *  Helper function is probably needed;
 */
export class TextDiv {
  id: string;
  canvasEl: HTMLDivElement;
  borders: Borders;
  el: HTMLDivElement = document.createElement('div');
  text: string;
  xPos: number;
  yPos: number;
  width: number = 0;
  height: number = 0;
  isSelected: boolean = true;
  isEdit: boolean = false;
  isDrag: boolean = false;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  onTextChanged?: (elementId: string, oldText: string, newText: string) => void;
  onPropertiesChanged?: (elementId: string, oldProps: any, newProps: any) => void;
  onMoved?: (elementId: string, oldPos: { xPos: number; yPos: number }, newPos: { xPos: number; yPos: number }) => void;
  onResized?: (elementId: string, oldSize: { width: number; height: number }, newSize: { width: number; height: number }) => void;
  xDragStartPos: null | number = null;
  yDragStartPos: null | number = null;
  dragStartPosition: { xPos: number; yPos: number } | null = null;
  resizeStartSize: { width: number; height: number } | null = null;

  constructor({ 
    id, canvasEl, borders, text, xPos, yPos, fontSize = 16, inputFn, selectEl, onDragStart, onDragEnd,
    onTextChanged, onPropertiesChanged, onMoved, onResized 
  }: TextDivProperties) {
    this.id = id;
    this.canvasEl = canvasEl;
    this.xPos = xPos;
    this.yPos = yPos;
    this.borders = borders;
    this.onDragStart = onDragStart;
    this.onDragEnd = onDragEnd;
    this.onTextChanged = onTextChanged;
    this.onPropertiesChanged = onPropertiesChanged;
    this.onMoved = onMoved;
    this.onResized = onResized;

    // Adding basics
    this.el.classList.add('divText');
    this.el.addEventListener('click', (evt: MouseEvent) => {
      console.log('event click');
      evt.stopImmediatePropagation();
      if (this.isDrag) {
        return;
      }
      if (!this.isSelected) {
        this.isSelected = true;
        selectEl(this.id);
        this.showBorders();
      } else {
        this.setIsEdit(true);
      }
    });

    this.el.addEventListener('mousedown', () => {
      if (this.isEdit) {
        return;
      }
      this.el.addEventListener('mousemove', this.checkDragThreshold);
    });

    this.el.addEventListener('mouseup', this.onMouseUp);

    this.el.addEventListener('input', () => {
      const newText = this.el.innerText;
      const oldText = this.text;
      
      if (oldText !== newText && this.onTextChanged) {
        this.onTextChanged(this.id, oldText, newText);
      }
      
      this.text = newText;
      inputFn(this.text);
      this.showBorders();
    });

    // Customization
    this.text = text;
    this.el.textContent = text;
    this.el.style.left = `${xPos}px`;
    this.el.style.top = `${yPos}px`;
    this.el.style.fontSize = `${fontSize}px`;
  }

  onMouseUp = () => {
    this.el.removeEventListener('mousemove', this.checkDragThreshold);
    if (this.isEdit) {
      return;
    }
    const isResize = this.borders.isResize;
    if (isResize) {
      console.log('onMouseUp isResize');
      this.borders.cancelResize();
      return;
    }
    // setTimeout to avoid calling setIsEdit before mouseup on click event
    setTimeout(() => {
      console.log('onMouseUp setTimeout');
      if (this.isEdit) {
        return;
      }
      
      // Отслеживаем завершение перемещения
      if (this.isDrag && this.dragStartPosition && this.onMoved) {
        const currentPos = { xPos: this.xPos, yPos: this.yPos };
        if (this.dragStartPosition.xPos !== currentPos.xPos || 
            this.dragStartPosition.yPos !== currentPos.yPos) {
          this.onMoved(this.id, this.dragStartPosition, currentPos);
        }
      }
      
      this.isDrag = false;
      this.onDragEnd(this.id);
      this.el.classList.remove('isDragging');
      this.xDragStartPos = null;
      this.yDragStartPos = null;
      this.dragStartPosition = null;
    }, 0);
  };

  checkDragThreshold = (evt: MouseEvent) => {
    if (this.isEdit || !this.isSelected) {
      this.el.removeEventListener('mousemove', this.checkDragThreshold);
      return;
    }
    const { xPos, yPos } = getElPosition({ evt, el: this.el });
    if (this.xDragStartPos === null || this.yDragStartPos === null) {
      this.xDragStartPos = xPos;
      this.yDragStartPos = yPos;
      return;
    }
    const dx = this.xDragStartPos - xPos;
    const dy = this.yDragStartPos - yPos;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      this.isDrag = true;
      this.dragStartPosition = { xPos: this.xPos, yPos: this.yPos };
      this.onDragStart(this.id);
      this.el.classList.add('isDragging');
      this.el.removeEventListener('mousemove', this.checkDragThreshold);
    }
  };

  resize(evt: MouseEvent) {
    if (!this.borders.isResize) {
      return;
    }
    const resizeBehavior = this.borders.resizeBehavior;
    const { xPos, yPos } = getElPosition({ evt, el: this.borders.borderEl });
    const { xPos: xCanvas, yPos: yCanvas } = getElPosition({ evt, el: this.canvasEl });
    if (this.xDragStartPos === null || this.yDragStartPos === null) {
      this.xDragStartPos = xCanvas;
      this.yDragStartPos = yCanvas;
    }
    if (resizeBehavior === 'right') {
      this.width = xPos;
      this.el.style.width = `${this.width}px`;
    }
    if (resizeBehavior === 'bot') {
      this.height = yPos;
      this.el.style.height = `${this.height}px`;
    }
    if (resizeBehavior === 'botRight') {
      this.width = xPos;
      this.height = yPos;
      this.el.style.width = `${this.width}px`;
      this.el.style.height = `${this.height}px`;
    }
    if (resizeBehavior === 'top') {
      this.yPos = yCanvas;
      this.el.style.top = `${this.yPos}px`;
      this.height = this.height - yPos;
      this.el.style.height = `${this.height}px`;
    }
    if (resizeBehavior === 'left') {
      this.xPos = xCanvas;
      this.el.style.left = `${this.xPos}px`;
      this.width = this.width - xPos;
      this.el.style.width = `${this.width}px`;
    }
    if (resizeBehavior === 'topLeft') {
      this.yPos = yCanvas;
      this.xPos = xCanvas;
      this.el.style.top = `${this.yPos}px`;
      this.el.style.left = `${this.xPos}px`;
      this.height = this.height - yPos;
      this.width = this.width - xPos;
      this.el.style.height = `${this.height}px`;
      this.el.style.width = `${this.width}px`;
    }
    if (resizeBehavior === 'topRight') {
      this.yPos = yCanvas;
      this.el.style.top = `${this.yPos}px`;
      this.height = this.height - yPos;
      this.width = xPos;
      this.el.style.height = `${this.height}px`;
      this.el.style.width = `${this.width}px`;
    }
    if (resizeBehavior === 'botLeft') {
      this.xPos = xCanvas;
      this.el.style.left = `${this.xPos}px`;
      this.height = yPos;
      this.width = this.width - xPos;
      this.el.style.height = `${this.height}px`;
      this.el.style.width = `${this.width}px`;
    }
    this.showBorders();
  }

  public moveEl(evt: MouseEvent) {
    const { xPos, yPos } = getElPosition({ evt, el: this.canvasEl });
    this.xPos = xPos - (this.xDragStartPos || 0);
    this.yPos = yPos - (this.yDragStartPos || 0);
    this.el.style.left = `${this.xPos}px`;
    this.el.style.top = `${this.yPos}px`;
    this.showBorders();
  }

  public updateText(text: string) {
    this.text = text;
    this.el.innerText = text;
    this.showBorders();
  }

  public updateFontSize(fontSize: number) {
    console.log('TextDiv: updating font size to', fontSize);
    const oldFontSize = parseInt(this.el.style.fontSize) || 16;
    
    if (oldFontSize !== fontSize && this.onPropertiesChanged) {
      this.onPropertiesChanged(this.id, { fontSize: oldFontSize }, { fontSize });
    }
    
    this.el.style.fontSize = `${fontSize}px`;
    // Обновляем границы так как размер элемента мог измениться
    setTimeout(() => {
      this.showBorders();
    }, 0);
  }

  showBorders() {
    this.borders.show(this.getPositions());
  }

  getPositions() {
    return {
      xPos: this.xPos,
      yPos: this.yPos,
      width: this.el.offsetWidth,
      height: this.el.offsetHeight,
    };
  }

  setIsEdit(isEdit: boolean) {
    if (this.isDrag) {
      return;
    }
    if (isEdit === true) {
      this.isEdit = true;
      this.el.contentEditable = 'true';
      return;
    }
    this.isEdit = false;
    this.el.contentEditable = 'false';
  }

  public deselect() {
    this.isSelected = false;
    this.setIsEdit(false);
  }

  /** TODO: Fix overlapping to the right and bottom
   *
   * Maybe temporarily make left='auto',
   * set right='0'
   * get leftPos side posistion
   * set left=`${leftPos}px`
   * set right='auto'
   */
  append() {
    this.canvasEl.appendChild(this.el);
    const width = this.el.offsetWidth;
    const height = this.el.offsetHeight;
    this.xPos = Math.floor(this.xPos - width / 2) || 0;
    this.yPos = Math.floor(this.yPos - height / 2) || 0;
    if (this.xPos < 0) {
      this.xPos = 0;
    }
    if (this.yPos < 0) {
      this.yPos = 0;
    }
    this.el.style.left = `${this.xPos}px`;
    this.el.style.top = `${this.yPos}px`;
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;
    this.width = width;
    this.height = height;
    this.showBorders();
  }
}
