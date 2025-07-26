export class IconDiv {
  id: string;
  canvasEl: HTMLDivElement;
  text: string;
  xPos: number;
  yPos: number;

  constructor({
    id,
    canvasEl,
    text,
    xPos,
    yPos,
  }: {
    id: string;
    canvasEl: HTMLDivElement;
    text: string;
    xPos: number;
    yPos: number;
  }) {
    this.id = id;
    this.canvasEl = canvasEl;
    this.text = text;
    this.xPos = xPos;
    this.yPos = yPos;
  }
} 