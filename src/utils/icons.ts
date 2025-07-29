// Импорты SVG файлов
import communitySvg from './icons/community.svg?raw';
import supportSvg from './icons/support.svg?raw';
import documentationSvg from './icons/documentation.svg?raw';
import toolingSvg from './icons/tooling.svg?raw';
import ecosystemSvg from './icons/ecosystem.svg?raw';
import type { IconName } from '../components/types';
import { getElPosition } from './position';
import { Borders } from './borders';

const DRAG_THRESHOLD = 5;

// SVG контент для иконок
const iconSvgMap: Record<IconName, string> = {
  Community: communitySvg,
  Support: supportSvg,
  Documentation: documentationSvg,
  Tooling: toolingSvg,
  Ecosystem: ecosystemSvg,
};

function getIconSvg(iconName: IconName): string {
  return iconSvgMap[iconName];
}

export type IconDivProperties = {
  id: string;
  canvasEl: HTMLDivElement;
  borders: Borders;
  iconName: IconName;
  xPos: number;
  yPos: number;
  iconColor?: string;
  selectEl: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  onPropertiesChanged?: (elementId: string, oldProps: any, newProps: any) => void;
  onMoved?: (elementId: string, oldPos: { xPos: number; yPos: number }, newPos: { xPos: number; yPos: number }) => void;
  onResized?: (elementId: string, oldSize: { width: number; height: number }, newSize: { width: number; height: number }) => void;
};

export class IconDiv {
  id: string;
  canvasEl: HTMLDivElement;
  borders: Borders;
  el: HTMLDivElement = document.createElement('div');
  svgContainer: HTMLDivElement = document.createElement('div');
  iconName: IconName;
  xPos: number;
  yPos: number;
  width: number = 0;
  height: number = 0;
  isSelected: boolean = true;
  isDrag: boolean = false;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  onPropertiesChanged?: (elementId: string, oldProps: any, newProps: any) => void;
  onMoved?: (elementId: string, oldPos: { xPos: number; yPos: number }, newPos: { xPos: number; yPos: number }) => void;
  onResized?: (elementId: string, oldSize: { width: number; height: number }, newSize: { width: number; height: number }) => void;
  xDragStartPos: null | number = null;
  yDragStartPos: null | number = null;
  dragStartPosition: { xPos: number; yPos: number } | null = null;

  constructor({
    id,
    canvasEl,
    borders,
    iconName,
    xPos,
    yPos,
    iconColor = '#333333',
    selectEl,
    onDragStart,
    onDragEnd,
    onPropertiesChanged,
    onMoved,
    onResized,
  }: IconDivProperties) {
    this.id = id;
    this.canvasEl = canvasEl;
    this.borders = borders;
    this.iconName = iconName;
    this.xPos = xPos;
    this.yPos = yPos;
    this.onDragStart = onDragStart;
    this.onDragEnd = onDragEnd;
    this.onPropertiesChanged = onPropertiesChanged;
    this.onMoved = onMoved;
    this.onResized = onResized;

    // Настройка базового элемента
    this.el.classList.add('divIcon');
    this.el.style.left = `${xPos}px`;
    this.el.style.top = `${yPos}px`;

    // Обработчики событий
    this.el.addEventListener('click', (evt: MouseEvent) => {
      console.log('icon click');
      evt.stopImmediatePropagation();
      if (this.isDrag) {
        return;
      }
      if (!this.isSelected) {
        this.isSelected = true;
        selectEl(this.id);
        this.showBorders();
      }
    });

    this.el.addEventListener('mousedown', () => {
      this.el.addEventListener('mousemove', this.checkDragThreshold);
    });

    this.el.addEventListener('mouseup', this.onMouseUp);

    // Создаем контейнер для SVG иконки
    this.svgContainer.style.color = iconColor;
    this.svgContainer.style.display = 'flex';
    this.svgContainer.style.alignItems = 'center';
    this.svgContainer.style.justifyContent = 'center';
    this.svgContainer.innerHTML = getIconSvg(this.iconName);
    
    this.el.appendChild(this.svgContainer);
  }

  onMouseUp = () => {
    this.el.removeEventListener('mousemove', this.checkDragThreshold);
    const isResize = this.borders.isResize;
    if (isResize) {
      console.log('onMouseUp isResize');
      this.borders.cancelResize();
      return;
    }
    // setTimeout to avoid calling setIsEdit before mouseup on click event
    setTimeout(() => {
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
    if (!this.isSelected) {
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

  public moveEl(evt: MouseEvent) {
    const { xPos, yPos } = getElPosition({ evt, el: this.canvasEl });
    this.xPos = xPos - (this.xDragStartPos || 0);
    this.yPos = yPos - (this.yDragStartPos || 0);
    this.el.style.left = `${this.xPos}px`;
    this.el.style.top = `${this.yPos}px`;
    this.showBorders();
  }

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

  public deselect() {
    this.isSelected = false;
  }

  public updateColor(color: string) {
    console.log('IconDiv: updating color to', color);
    const oldColor = this.svgContainer.style.color || '#333333';
    
    if (oldColor !== color && this.onPropertiesChanged) {
      this.onPropertiesChanged(this.id, { color: oldColor }, { color });
    }
    
    this.svgContainer.style.color = color;
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