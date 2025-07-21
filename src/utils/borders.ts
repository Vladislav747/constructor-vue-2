type CornerPosition = 'topLeft' | 'topRight' | 'botLeft' | 'botRight';
type BorderPosition = 'top' | 'right' | 'bot' | 'left';

class CornerControl {
  el: HTMLDivElement;
  position: CornerPosition;

  constructor(position: CornerPosition) {
    this.position = position;
    this.el = document.createElement('div');
    this.el.classList.add('borderCorner', position);
  }
}

/** Singletone */
export class Borders {
  canvasEl: HTMLDivElement;
  borderEl: HTMLDivElement;
  borderEdges: Record<BorderPosition, HTMLDivElement>;
  cornerControls: Record<CornerPosition, CornerControl>;
  isResize: boolean = false;
  resizeBehavior: BorderPosition | CornerPosition= 'top';

  constructor({ canvasEl }: { canvasEl: HTMLDivElement }) {
    this.borderEl = document.createElement('div');
    this.borderEl.classList.add('elementBorders');
    this.canvasEl = canvasEl;
    this.canvasEl.appendChild(this.borderEl);

    this.borderEdges = {
      top: this.createEdge('top'),
      right: this.createEdge('right'),
      bot: this.createEdge('bot'),
      left: this.createEdge('left'),
    };

    this.cornerControls = {
      topLeft: new CornerControl('topLeft'),
      topRight: new CornerControl('topRight'),
      botLeft: new CornerControl('botLeft'),
      botRight: new CornerControl('botRight'),
    };

    (Object.keys(this.cornerControls) as CornerPosition[]).forEach((key: CornerPosition) =>
    {
      const el = this.cornerControls[key].el;
      el.addEventListener('mousedown', (evt: MouseEvent) => this.onResizeStart(evt, key));
      this.borderEl.append(this.cornerControls[key].el);
    }
    );
  }

  createEdge(position: BorderPosition): HTMLDivElement {
    const el = document.createElement('div');
    el.classList.add('borderEdge', position);
    this.borderEl.appendChild(el);
    el.addEventListener('mousedown', (evt: MouseEvent) => this.onResizeStart(evt, position));
    return el;
  }

  onResizeStart(evt: MouseEvent, behavior: BorderPosition | CornerPosition) {
    console.log('onResizeStart', behavior);
    this.isResize = true;
    this.resizeBehavior = behavior;
  }

  cancelResize = () => {
    console.log('cancelResize');
    setTimeout(() => {
      this.isResize = false;
    }, 0);
  };

  show({ xPos, yPos, width, height }: { xPos: number; yPos: number; width: number; height: number }) {
    this.borderEl.style.display = 'block';
    this.setSize({ width, height });
    this.setPositions({ xPos, yPos });
  }

  hide() {
    this.borderEl.style.display = 'none';
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
