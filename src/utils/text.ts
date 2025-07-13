/** TODO: redo in "left" and "top" properties
 *  to "transform: translate(xPos: px, yPos: px)"
 *
 *  Helper function is probably needed;
 */
export class TextDiv {
  el: HTMLDivElement;
  canvas: HTMLDivElement;
  xPos: number;
  yPos: number;

  constructor({ canvas, el, text, xPos, yPos }: { text: string; xPos: number; yPos: number; canvas: HTMLDivElement; el?: HTMLDivElement }) {
    this.el = el || document.createElement("div");
    this.canvas = canvas;
    this.xPos = xPos;
    this.yPos = yPos;

    // Adding basics
    this.el.classList.add("divText");
    this.el.addEventListener("click", (evt: MouseEvent) => {
      evt.stopImmediatePropagation();
    });

    // Customization
    this.el.textContent = text;
    this.el.style.left = `${xPos}px`;
    this.el.style.top = `${yPos}px`;
  }

  /** TODO: Fix overlapping to the right and bottom */
  append() {
    this.canvas.appendChild(this.el);
    const width = this.el.offsetWidth;
    const height = this.el.offsetHeight;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    this.xPos = Math.floor(this.xPos - halfWidth) || 0;
    this.yPos = Math.floor(this.yPos - halfHeight) || 0;
    if (this.xPos < 0) {
      this.xPos = 0;
    }
    if (this.yPos < 0) {
      this.yPos = 0;
    }
    this.el.style.left = `${this.xPos}px`;
    this.el.style.top = `${this.yPos}px`;
  }
}
