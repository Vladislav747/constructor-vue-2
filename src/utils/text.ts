import { getElPosition } from "@/utils/position";
import { Borders } from "./borders";
import { defaultFontSize } from "./defaultValues";

const DRAG_THRESHOLD = 5;

const getDragThreshold = (): number => {
  // Высокие DPI
  if (window.devicePixelRatio > 2) {
    return 8;
  }

  // Стандартные устройства
  return 5;
};

const getMinHeight = (fontSize: number): number => {
  // Вычисляет минимальную высоту текстового элемента на основе размера шрифта
  // Убывающий коэффициент: от 2.0 для маленьких шрифтов до 1.2 для больших
  // Формула: coefficient = max(1.2, 2.5 - fontSize/32)
  // Примеры: fontSize=16 → coeff=2.0 → height=32px
  //          fontSize=32 → coeff=1.5 → height=48px  
  //          fontSize=52 → coeff=1.2 → height=62px
  const coefficient = Math.max(1.2, 2.5 - fontSize / 32);
  return fontSize * coefficient;
};

export type TextDivProperties = {
  id: string;
  canvasEl: HTMLDivElement;
  borders: Borders;
  text: string;
  xPos: number;
  yPos: number;
  fontSize?: number;
  inputFn: (value: string) => void;
  selectEl: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  onTextChanged?: (elementId: string, oldText: string, newText: string) => void;
  onPropertiesChanged?: (
    elementId: string,
    oldProps: any,
    newProps: any
  ) => void;
  onMoved?: (
    elementId: string,
    oldPos: { xPos: number; yPos: number },
    newPos: { xPos: number; yPos: number }
  ) => void;
  onResized?: (
    elementId: string,
    oldSize: { width: number; height: number },
    newSize: { width: number; height: number }
  ) => void;
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
  el: HTMLDivElement = document.createElement("div");
  text: string;
  xPos: number;
  yPos: number;
  width: number = 0;
  height: number = 0;
  isSelected: boolean = true;
  isEdit: boolean = false;
  isDrag: boolean = false;
  fontSize: number;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  onTextChanged?: (elementId: string, oldText: string, newText: string) => void;
  onPropertiesChanged?: (
    elementId: string,
    oldProps: any,
    newProps: any
  ) => void;
  onMoved?: (
    elementId: string,
    oldPos: { xPos: number; yPos: number },
    newPos: { xPos: number; yPos: number }
  ) => void;
  onResized?: (
    elementId: string,
    oldSize: { width: number; height: number },
    newSize: { width: number; height: number }
  ) => void;
  xDragStartPos: null | number = null;
  yDragStartPos: null | number = null;
  dragStartPosition: { xPos: number; yPos: number } | null = null;
  resizeStartSize: { width: number; height: number } | null = null;

  constructor({
    id,
    canvasEl,
    borders,
    text,
    xPos,
    yPos,
    fontSize = defaultFontSize,
    inputFn,
    selectEl,
    onDragStart,
    onDragEnd,
    onTextChanged,
    onPropertiesChanged,
    onMoved,
    onResized,
  }: TextDivProperties) {
    this.id = id;
    this.canvasEl = canvasEl;
    this.xPos = xPos;
    this.yPos = yPos;
    this.borders = borders;
    this.fontSize = fontSize;
    this.onDragStart = onDragStart;
    this.onDragEnd = onDragEnd;
    this.onTextChanged = onTextChanged;
    this.onPropertiesChanged = onPropertiesChanged;
    this.onMoved = onMoved;
    this.onResized = onResized;

    // Adding basics
    this.el.classList.add("divText");
    this.el.addEventListener("click", (evt: MouseEvent) => {
      console.log("event click");
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

    this.el.addEventListener("mousedown", () => {
      if (this.isEdit) {
        return;
      }
      this.el.addEventListener("mousemove", this.checkDragThreshold);
    });

    this.el.addEventListener("mouseup", this.onMouseUp);

    this.el.addEventListener("input", () => {
      const newText = this.el.innerText;
      const oldText = this.text;

      if (oldText !== newText && this.onTextChanged) {
        this.onTextChanged(this.id, oldText, newText);
      }

      this.text = newText;
      inputFn(this.text);
      this.showBorders();
    });

    // Customization
    this.text = text;
    this.el.textContent = text;
    this.el.style.left = `${xPos}px`;
    this.el.style.top = `${yPos}px`;
    this.el.style.fontSize = `${fontSize}px`;
  }

  onMouseUp = () => {
    this.el.removeEventListener("mousemove", this.checkDragThreshold);
    if (this.isEdit) {
      return;
    }
    const isResize = this.borders.isResize;
    if (isResize) {
      console.log("onMouseUp isResize");
      this.borders.cancelResize();
      return;
    }
    // setTimeout to avoid calling setIsEdit before mouseup on click event
    setTimeout(() => {
      console.log("onMouseUp setTimeout");
      if (this.isEdit) {
        return;
      }

      // Отслеживаем завершение перемещения
      if (this.isDrag && this.dragStartPosition && this.onMoved) {
        const currentPos = { xPos: this.xPos, yPos: this.yPos };
        if (
          this.dragStartPosition.xPos !== currentPos.xPos ||
          this.dragStartPosition.yPos !== currentPos.yPos
        ) {
          this.onMoved(this.id, this.dragStartPosition, currentPos);
        }
      }

      this.isDrag = false;
      this.onDragEnd(this.id);
      this.el.classList.remove("isDragging");
      this.xDragStartPos = null;
      this.yDragStartPos = null;
      this.dragStartPosition = null;
    }, 0);
  };

  checkDragThreshold = (evt: MouseEvent) => {
    if (this.isEdit || !this.isSelected) {
      this.el.removeEventListener("mousemove", this.checkDragThreshold);
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
      this.el.classList.add("isDragging");
      this.el.removeEventListener("mousemove", this.checkDragThreshold);
    }
  };

  resize(evt: MouseEvent) {
    if (!this.borders.isResize) {
      return;
    }
    const resizeBehavior = this.borders.resizeBehavior;
    const { xPos, yPos } = getElPosition({ evt, el: this.borders.borderEl });
    const { xPos: xCanvas, yPos: yCanvas } = getElPosition({
      evt,
      el: this.canvasEl,
    });
    if (this.xDragStartPos === null || this.yDragStartPos === null) {
      this.xDragStartPos = xCanvas;
      this.yDragStartPos = yCanvas;
    }
    if (resizeBehavior === "right") {
      // Изменение размера вправо: ограничиваем ширину правой границей канваса
      const canvasWidth = this.canvasEl.offsetWidth;
      const maxWidth = canvasWidth - this.xPos; // Максимальная доступная ширина от текущей позиции
      this.width = Math.max(this.fontSize * 4, Math.min(xPos, maxWidth));
      console.log("this.width", this.width);
      this.el.style.width = `${this.width}px`;
    }
    if (resizeBehavior === "bot") {
      // Изменение размера вниз: ограничиваем высоту нижней границей канваса
      const canvasHeight = this.canvasEl.offsetHeight;
      const maxHeight = canvasHeight - this.yPos; // Максимальная доступная высота от текущей позиции
      this.height = Math.max(getMinHeight(this.fontSize), Math.min(yPos, maxHeight));
      this.el.style.height = `${this.height}px`;
    }
    if (resizeBehavior === "botRight") {
      // Изменение размера по диагонали (вниз-вправо): ограничиваем обе стороны
      const canvasWidth = this.canvasEl.offsetWidth;
      const canvasHeight = this.canvasEl.offsetHeight;
      const maxWidth = canvasWidth - this.xPos;   // Ограничение по правой границе
      const maxHeight = canvasHeight - this.yPos; // Ограничение по нижней границе
      this.width = Math.max(this.fontSize * 4, Math.min(xPos, maxWidth));
      this.height = Math.max(getMinHeight(this.fontSize), Math.min(yPos, maxHeight));
      this.el.style.width = `${this.width}px`;
      this.el.style.height = `${this.height}px`;
    }
                      if (resizeBehavior === "top") {
        // Изменение размера сверху: элемент двигается вверх, высота изменяется
        // Ограничиваем позицию верхней границей канваса (не выше 0)
        this.yPos = Math.max(0, yCanvas);
        const newHeight = this.height - yPos;
        this.height = Math.max(getMinHeight(this.fontSize), newHeight);
        
        this.el.style.top = `${this.yPos}px`;
        this.el.style.height = `${this.height}px`;
      }
    if (resizeBehavior === "left") {
      // Изменение размера слева: элемент двигается влево, ширина изменяется
      // Ограничиваем позицию левой границей канваса (не левее 0)
      this.xPos = Math.max(0, xCanvas);
      this.width = Math.max(this.fontSize * 4, this.width - xPos);
      
      this.el.style.left = `${this.xPos}px`;
      this.el.style.width = `${this.width}px`;
    }
                      if (resizeBehavior === "topLeft") {
        // Изменение размера по диагонали (вверх-влево): элемент двигается в оба направления
        // Ограничиваем позицию верхней и левой границами канваса
        this.yPos = Math.max(0, yCanvas);
        this.xPos = Math.max(0, xCanvas);
        const newHeight = this.height - yPos;
        this.height = Math.max(getMinHeight(this.fontSize), newHeight);
        this.width = Math.max(this.fontSize * 4, this.width - xPos);
        
        this.el.style.top = `${this.yPos}px`;
        this.el.style.left = `${this.xPos}px`;
        this.el.style.height = `${this.height}px`;
        this.el.style.width = `${this.width}px`;
      }
    if (resizeBehavior === "topRight") {
      // Изменение размера по диагонали (вверх-вправо): элемент двигается вверх, расширяется вправо
      const canvasWidth = this.canvasEl.offsetWidth;
      const maxWidth = canvasWidth - this.xPos; // Ограничение по правой границе
      
      this.yPos = Math.max(0, yCanvas); // Ограничение по верхней границе
      this.height = Math.max(getMinHeight(this.fontSize), this.height - yPos);
      this.width = Math.max(this.fontSize * 4, Math.min(xPos, maxWidth));
      
      this.el.style.top = `${this.yPos}px`;
      this.el.style.height = `${this.height}px`;
      this.el.style.width = `${this.width}px`;
    }
    if (resizeBehavior === "botLeft") {
      // Изменение размера по диагонали (вниз-влево): элемент расширяется вниз, двигается влево
      const canvasHeight = this.canvasEl.offsetHeight;
      const maxHeight = canvasHeight - this.yPos; // Ограничение по нижней границе
      
      this.xPos = Math.max(0, xCanvas); // Ограничение по левой границе
      this.height = Math.max(getMinHeight(this.fontSize), Math.min(yPos, maxHeight));
      this.width = Math.max(this.fontSize * 4, this.width - xPos);
      
      this.el.style.left = `${this.xPos}px`;
      this.el.style.height = `${this.height}px`;
      this.el.style.width = `${this.width}px`;
    }
    this.showBorders();
  }

  public moveEl(evt: MouseEvent) {
    const { xPos, yPos } = getElPosition({ evt, el: this.canvasEl });
    // Вычисляем новую позицию с учетом точки захвата при начале перетаскивания
    const newXPos = xPos - (this.xDragStartPos || 0);
    const newYPos = yPos - (this.yDragStartPos || 0);
    
    // Получаем размеры канваса и текущего элемента для расчета границ
    const canvasWidth = this.canvasEl.offsetWidth;
    const canvasHeight = this.canvasEl.offsetHeight;
    const elementWidth = this.el.offsetWidth;
    const elementHeight = this.el.offsetHeight;
    
    // Ограничиваем позицию элемента границами канваса:
    // - Левая граница: не меньше 0
    // - Правая граница: не больше (ширина_канваса - ширина_элемента)
    // - Верхняя граница: не меньше 0  
    // - Нижняя граница: не больше (высота_канваса - высота_элемента)
    this.xPos = Math.max(0, Math.min(newXPos, canvasWidth - elementWidth));
    this.yPos = Math.max(0, Math.min(newYPos, canvasHeight - elementHeight));
    
    this.el.style.left = `${this.xPos}px`;
    this.el.style.top = `${this.yPos}px`;
    this.showBorders();
  }

  public updateText(text: string) {
    this.text = text;
    this.el.innerText = text;
    this.showBorders();
  }

  public updateFontSize(fontSize: number) {
    console.log("TextDiv: updating font size to", fontSize);
    const oldFontSize = parseInt(this.el.style.fontSize) || 16;

    if (oldFontSize !== fontSize && this.onPropertiesChanged) {
      this.onPropertiesChanged(
        this.id,
        { fontSize: oldFontSize },
        { fontSize }
      );
    }

    this.el.style.fontSize = `${fontSize}px`;
    // Обновляем границы так как размер элемента мог измениться
    setTimeout(() => {
      this.showBorders();
    }, 0);
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
      this.el.contentEditable = "true";
      return;
    }
    this.isEdit = false;
    this.el.contentEditable = "false";
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
    
    // Получаем размеры канваса для расчета границ
    const canvasWidth = this.canvasEl.offsetWidth;
    const canvasHeight = this.canvasEl.offsetHeight;
    
    // Позиционируем элемент по центру исходной позиции клика/касания
    this.xPos = Math.floor(this.xPos - width / 2) || 0;
    this.yPos = Math.floor(this.yPos - height / 2) || 0;
    
    // Ограничиваем позицию границами канваса чтобы элемент был полностью видим:
    // - По горизонтали: от 0 до (ширина_канваса - ширина_элемента)
    // - По вертикали: от 0 до (высота_канваса - высота_элемента)
    this.xPos = Math.max(0, Math.min(this.xPos, canvasWidth - width));
    this.yPos = Math.max(0, Math.min(this.yPos, canvasHeight - height));
    
    this.el.style.left = `${this.xPos}px`;
    this.el.style.top = `${this.yPos}px`;
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;
    this.width = width;
    this.height = height;
    this.showBorders();
  }
}
