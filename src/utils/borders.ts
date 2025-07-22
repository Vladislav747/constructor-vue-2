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

class BorderEdge {
  el: HTMLDivElement;
  position: BorderPosition;
  constructor(position: BorderPosition) {
    this.position = position;
    this.el = document.createElement('div');
    this.el.classList.add('borderEdge', position);
  }
}

const createCornerControls = (parent: HTMLElement, onResizeStart: (pos: CornerPosition) => void): Record<CornerPosition, CornerControl> => {
  const cornerPositions: CornerPosition[] = ['topLeft', 'topRight', 'botLeft', 'botRight'];
  const controls = {} as Record<CornerPosition, CornerControl>;
  cornerPositions.forEach((pos) => {
    const control = new CornerControl(pos);
    control.el.addEventListener('mousedown', () => onResizeStart(pos));
    parent.appendChild(control.el);
    controls[pos] = control;
  });
  return controls;
};

const createBorderEdges = (parent: HTMLElement, onResizeStart: (pos: BorderPosition) => void): Record<BorderPosition, BorderEdge> => {
  const edgePositions: BorderPosition[] = ['top', 'right', 'bot', 'left'];
  const edges = {} as Record<BorderPosition, BorderEdge>;
  edgePositions.forEach((pos) => {
    const edge = new BorderEdge(pos);
    edge.el.addEventListener('mousedown', () => onResizeStart(pos));
    parent.appendChild(edge.el);
    edges[pos] = edge;
  });
  return edges;
};

/** Singleton */
export class Borders {
  canvasEl: HTMLDivElement;
  borderEl: HTMLDivElement;
  borderEdges: Record<BorderPosition, BorderEdge>;
  cornerControls: Record<CornerPosition, CornerControl>;
  isResize: boolean = false;
  resizeBehavior: BorderPosition | CornerPosition = 'top';

  constructor({ canvasEl }: { canvasEl: HTMLDivElement }) {
    this.borderEl = document.createElement('div');
    this.borderEl.classList.add('elementBorders');
    this.canvasEl = canvasEl;
    this.canvasEl.appendChild(this.borderEl);

    this.borderEdges = createBorderEdges(this.borderEl, this.onResizeStart);
    this.cornerControls = createCornerControls(this.borderEl, this.onResizeStart);
  }

  onResizeStart = (behavior: BorderPosition | CornerPosition) => {
    this.isResize = true;
    this.resizeBehavior = behavior;
  };

  cancelResize = () => {
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
