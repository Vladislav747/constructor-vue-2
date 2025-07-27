export class IconDiv {
  id: string;
  canvasEl: HTMLDivElement;
  el: HTMLDivElement = document.createElement('div');
  iconName: string;
  xPos: number;
  yPos: number;
  width: number = 0;
  height: number = 0;

  constructor({
    id,
    canvasEl,
    iconName,
    xPos,
    yPos,
  }: {
    id: string;
    canvasEl: HTMLDivElement;
    iconName: string;
    xPos: number;
    yPos: number;
  }) {
    this.id = id;
    this.canvasEl = canvasEl;
    this.iconName = iconName;
    this.xPos = xPos;
    this.yPos = yPos;
    this.el.classList.add('divIcon');
  }


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
  }
} 