import { getCanvasPosition } from '@/utils/position';
import { Borders } from './borders';

const DRAG_THRESHOLD = 5;

export type TextDivProperties = {
  id: string;
  canvasEl: HTMLDivElement;
  borders: Borders;
  text: string;
  xPos: number;
  yPos: number;
  inputFn: (value: string) => void;
  selectEl: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
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
  isSelected: boolean = true;
  isEdit: boolean = false;
  isDrag: boolean = false;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  xDragStartPos: null | number = null;
  yDragStartPos: null | number = null;

  constructor({ id, canvasEl, borders, text, xPos, yPos, inputFn, selectEl, onDragStart, onDragEnd }: TextDivProperties) {
    this.id = id;
    this.canvasEl = canvasEl;
    this.xPos = xPos;
    this.yPos = yPos;
    this.borders = borders;
    this.onDragStart = onDragStart;
    this.onDragEnd = onDragEnd;

    // Adding basics
    this.el.classList.add('divText');
    this.el.addEventListener('click', (evt: MouseEvent) => {
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
      this.text = this.el.innerText;
      inputFn(this.text);
      this.showBorders();
    });

    // Customization
    this.text = text;
    this.el.textContent = text;
    this.el.style.left = `${xPos}px`;
    this.el.style.top = `${yPos}px`;
  }

  onMouseUp = () => {
    if (this.isEdit) {
      return;
    }
    // setTimeout to avoid calling setIsEdit before mouseup on click event
    setTimeout(() => {
      if (this.isEdit) {
        return;
      }
      this.isDrag = false;
      this.onDragEnd(this.id);
      this.el.classList.remove('isDragging');
      this.xDragStartPos = null;
      this.yDragStartPos = null;
    }, 0);
  };

  checkDragThreshold = (evt: MouseEvent) => {
    if (this.isEdit || !this.isSelected) {
      this.el.removeEventListener('mousemove', this.checkDragThreshold);
      return;
    }
    const { xPos, yPos } = getCanvasPosition({ event: evt, canvasEl: this.el });
    if (this.xDragStartPos === null || this.yDragStartPos === null) {
      this.xDragStartPos = xPos;
      this.yDragStartPos = yPos;
      return;
    }
    const dx = this.xDragStartPos - xPos;
    const dy = this.yDragStartPos - yPos;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      this.isDrag = true;
      this.onDragStart(this.id);
      this.el.classList.add('isDragging');
      this.el.removeEventListener('mousemove', this.checkDragThreshold);
    }
  };

  public moveEl(evt: MouseEvent) {
    const { xPos: xPosCanvas, yPos: yPosCanvas } = getCanvasPosition({
      event: evt,
      canvasEl: this.canvasEl,
    });
    this.xPos = xPosCanvas - (this.xDragStartPos || 0);
    this.yPos = yPosCanvas - (this.yDragStartPos || 0);
    this.el.style.left = `${this.xPos}px`;
    this.el.style.top = `${this.yPos}px`;
    this.showBorders();
  }

  public updateText(text: string) {
    this.text = text;
    this.el.innerText = text;
    this.showBorders();
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
    this.showBorders();
  }
}
