import { Borders } from "./borders";

export type TextDivProperties = {
  canvasEl: HTMLDivElement;
  borders: Borders;
  text: string;
  xPos: number;
  yPos: number;
  inputFn: (value: string) => void;
};

/** TODO: redo in "left" and "top" properties
 *  to "transform: translate(xPos: px, yPos: px)"
 *
 *  Helper function is probably needed;
 */
export class TextDiv {
  canvasEl: HTMLDivElement;
  borders: Borders;
  el: HTMLDivElement;
  xPos: number;
  yPos: number;
  isSelected: boolean;

  constructor({ canvasEl, borders, text, xPos, yPos, inputFn }: TextDivProperties) {
    console.log("TextDiv constructor");

    this.el = document.createElement("div");
    this.canvasEl = canvasEl;
    this.xPos = xPos;
    this.yPos = yPos;
    this.borders = borders;
    this.isSelected = true;

    // Adding basics
    this.el.classList.add("divText");
    this.el.contentEditable = "true";
    this.el.addEventListener("click", (evt: MouseEvent) => {
      evt.stopImmediatePropagation();
      if (this.isSelected) {
        this.isSelected = false;
        this.borders.hide();
      } else {
        this.isSelected = true;
        this.borders.show(this.getPositions());
      }
    });

    /** Fix editing selected div throught <textarea>
     *
     * Also make it reflect other changes throught controls
     */
    this.el.addEventListener("input", () => {
      inputFn(this.el.innerHTML);
      this.borders.show(this.getPositions());
    });

    // Customization
    this.el.textContent = text;
    this.el.style.left = `${xPos}px`;
    this.el.style.top = `${yPos}px`;
  }

  getPositions() {
    return {
      xPos: this.xPos,
      yPos: this.yPos,
      width: this.el.offsetWidth,
      height: this.el.offsetHeight,
    };
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
    this.borders.show(this.getPositions());
  }
}
