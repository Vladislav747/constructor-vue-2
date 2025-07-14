/** Singletone */
export class Borders {
  canvasEl: HTMLDivElement;
  borderEl: HTMLDivElement;

  constructor({ canvasEl }: { canvasEl: HTMLDivElement }) {
    console.log("Borders constructor");
    this.borderEl = document.createElement("div");
    this.borderEl.classList.add("elementBorders");
    this.canvasEl = canvasEl;
    this.canvasEl.appendChild(this.borderEl);
  }

  show({ xPos, yPos, width, height }: { xPos: number; yPos: number; width: number; height: number }) {
    this.borderEl.style.display = "block";
    this.setSize({ width, height });
    this.setPositions({ xPos, yPos });
  }

  hide() {
    this.borderEl.style.display = "none";
  }

  setPositions({ xPos, yPos }: { xPos: number; yPos: number }) {
    this.borderEl.style.top = `${yPos}px`;
    this.borderEl.style.left = `${xPos}px`;
  }

  setSize({ width, height }: { width: number; height: number }) {
    this.borderEl.style.width = `${width}px`;
    this.borderEl.style.height = `${height}px`;
  }
}
