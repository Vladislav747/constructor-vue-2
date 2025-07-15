import { Borders } from './borders';

export type TextDivProperties = {
  id: string;
  canvasEl: HTMLDivElement;
  borders: Borders;
  text: string;
  xPos: number;
  yPos: number;
  inputFn: (value: string) => void;
  selectEl: (id: string) => void;
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

  constructor({ id, canvasEl, borders, text, xPos, yPos, inputFn, selectEl }: TextDivProperties) {
    console.log('TextDiv constructor');

    this.id = id;
    this.canvasEl = canvasEl;
    this.xPos = xPos;
    this.yPos = yPos;
    this.borders = borders;

    // Adding basics
    this.el.classList.add('divText');
    this.el.addEventListener('click', (evt: MouseEvent) => {
      evt.stopImmediatePropagation();
      if (!this.isSelected) {
        this.isSelected = true;
        selectEl(this.id);
        this.showBorders();
      } else {
        this.setIsEdit(true);
      }
    });

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

  outerUpdateText(text: string) {
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
    if (isEdit === true) {
      this.isEdit = true;
      this.el.contentEditable = 'true';
      return;
    }
    this.isEdit = false;
    this.el.contentEditable = 'false';
  }

  deselect() {
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
