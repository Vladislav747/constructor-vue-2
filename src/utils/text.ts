import { getElPosition } from "@/utils/position";
import type { Borders } from "./borders";
import { defaultFontSize } from "./defaultValues";

const DRAG_THRESHOLD = 3; // Уменьшили порог

const getDragThreshold = (): number => {
  // Высокие DPI - нужен больший порог в пикселях
  if (window.devicePixelRatio > 2) {
    return 4;
  }
  
  // Планшеты и сенсорные устройства
  if ('ontouchstart' in window) {
    return 6;
  }

  // Стандартные устройства с мышью
  return 3;
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

export type TextAlignment = 'left' | 'center' | 'right';

export type TextDivProperties = {
  id: string;
  canvasEl: HTMLDivElement;
  borders: Borders;
  text: string;
  xPos: number;
  yPos: number;
  fontSize?: number;
  fontName?: string;
  fontStyle?: string;
  fontColor?: string;
  fontColorBg?: string;
  fontRadius?: string;
  fontAlign?: string;
  textAlign?: TextAlignment;
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
  readonly type = 'text' as const; // Добавляем идентификатор типа
  id: string;
  canvasEl: HTMLDivElement;
  borders: Borders;
  el: HTMLDivElement = document.createElement("div");
  text: string;
  fontSize: number = 12;
  fontName?: string = 'Inter';
  fontStyle?: string = 'normal';
  fontColor?: string = '#001122';
  fontColorBg?: string = 'Без цвета';
  fontRadius?: string = '0';
  fontAlign?: string = 'left';
  xPos: number;
  yPos: number;
  width: number = 0;
  height: number = 0;
  isSelected: boolean = true;
  isEdit: boolean = false;
  isDrag: boolean = false;
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
    fontName,
    fontStyle,
    fontColor,
    fontColorBg,
    fontRadius,
    fontAlign,
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
    this.fontName = fontName;
    this.fontStyle = fontStyle;
    this.fontColor = fontColor;
    this.fontColorBg = fontColorBg;
    this.fontRadius = fontRadius;
    this.fontAlign = fontAlign;
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

    this.el.addEventListener("mousedown", (evt: MouseEvent) => {
      if (this.isEdit) {
        return;
      }
      
      // Предотвращаем стандартное поведение браузера
      evt.preventDefault();
      
      // Запоминаем начальную позицию мыши
      const { xPos, yPos } = getElPosition({ evt, el: this.el });
      this.xDragStartPos = xPos;
      this.yDragStartPos = yPos;
      
      // Добавляем обработчики на document для лучшего отслеживания
      document.addEventListener("mousemove", this.checkDragThreshold);
      document.addEventListener("mouseup", this.onMouseUp);
    });

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
    
    // Применяем все стили
    this.applyStyles();
  }

  // Метод для применения всех CSS стилей
  private applyStyles(): void {
    // Позиционирование
    this.el.style.left = `${this.xPos}px`;
    this.el.style.top = `${this.yPos}px`;
    
    // Шрифт и размер
    this.el.style.fontSize = `${this.fontSize}px`;
    this.el.style.fontFamily = this.fontName || 'Inter';
    
    // Стиль шрифта (normal, italic, oblique)
    if (this.fontStyle && this.fontStyle !== 'normal') {
      this.el.style.fontStyle = this.fontStyle.toLowerCase();
    } else {
      this.el.style.fontStyle = 'normal';
    }
    
    // Цвет текста
    if (this.fontColor && this.fontColor !== '#001122') {
      this.el.style.color = this.fontColor;
    }
    
    // Выравнивание текста
    this.el.style.textAlign = this.fontAlign || 'left';
    
    // Радиус границ
    if (this.fontRadius && this.fontRadius !== '0') {
      this.el.style.borderRadius = `${this.fontRadius}px`;
    }
    
    // Цвет фона
    if (this.fontColorBg && this.fontColorBg !== 'Без цвета') {
      this.el.style.backgroundColor = this.fontColorBg;
      // Добавляем немного padding для лучшего вида
      this.el.style.padding = '4px 8px';
    } else {
      this.el.style.backgroundColor = 'transparent';
      this.el.style.padding = '0';
    }
  }

  onMouseUp = () => {
    // Удаляем все обработчики с document
    document.removeEventListener("mousemove", this.checkDragThreshold);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    
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
      document.removeEventListener("mousemove", this.checkDragThreshold);
      return;
    }
    
    // Получаем текущую позицию мыши относительно элемента
    const { xPos, yPos } = getElPosition({ evt, el: this.el });
    
    // Если начальная позиция не была установлена, устанавливаем её
    if (this.xDragStartPos === null || this.yDragStartPos === null) {
      this.xDragStartPos = xPos;
      this.yDragStartPos = yPos;
      return;
    }
    
    // Вычисляем расстояние перемещения
    const dx = this.xDragStartPos - xPos;
    const dy = this.yDragStartPos - yPos;
    const distance = Math.sqrt(dx * dx + dy * dy); // Евклидово расстояние
    
    // Используем умный порог в зависимости от устройства
    const threshold = getDragThreshold();
    
    // Проверяем превышен ли порог
    if (distance > threshold) {
      this.isDrag = true;
      this.dragStartPosition = { xPos: this.xPos, yPos: this.yPos };
      this.onDragStart(this.id);
      this.el.classList.add("isDragging");
      
      // Удаляем обработчик проверки порога и добавляем обработчик перемещения
      document.removeEventListener("mousemove", this.checkDragThreshold);
      document.addEventListener("mousemove", this.handleMouseMove);
    }
  };

  // Отдельный обработчик для перемещения после превышения порога
  handleMouseMove = (evt: MouseEvent) => {
    if (this.isDrag) {
      this.moveEl(evt);
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

  // Методы для обновления отдельных стилей
  public updateFontSize(fontSize: string | number): void {
    const fontSizeValue = typeof fontSize === 'string' ? parseInt(fontSize, 10) : fontSize;
    this.fontSize = fontSizeValue;
    this.el.style.fontSize = `${fontSizeValue}px`;
    this.showBorders();
  }

  public updateFontName(fontName: string): void {
    this.fontName = fontName;
    this.el.style.fontFamily = fontName;
    this.showBorders();
  }

  public updateFontStyle(fontStyle: string): void {
    this.fontStyle = fontStyle;
    if (fontStyle && fontStyle !== 'normal') {
      this.el.style.fontStyle = fontStyle.toLowerCase();
    } else {
      this.el.style.fontStyle = 'normal';
    }
    this.showBorders();
  }

  public updateFontColor(fontColor: string): void {
    this.fontColor = fontColor;
    this.el.style.color = fontColor;
    this.showBorders();
  }

  public updateFontAlign(fontAlign: string): void {
    this.fontAlign = fontAlign;
    this.el.style.textAlign = fontAlign;
    this.showBorders();
  }

  public updateFontRadius(fontRadius: string): void {
    this.fontRadius = fontRadius;
    if (fontRadius && fontRadius !== '0') {
      this.el.style.borderRadius = `${fontRadius}px`;
    } else {
      this.el.style.borderRadius = '0';
    }
    this.showBorders();
  }

  public updateFontColorBg(fontColorBg: string): void {
    this.fontColorBg = fontColorBg;
    if (fontColorBg && fontColorBg !== 'Без цвета') {
      this.el.style.backgroundColor = fontColorBg;
      this.el.style.padding = '4px 8px';
    } else {
      this.el.style.backgroundColor = 'transparent';
      this.el.style.padding = '0';
    }
    this.showBorders();
  }

  // Метод для обновления всех стилей сразу
  public updateAllStyles(styles: Partial<{
    fontSize: number;
    fontName: string;
    fontStyle: string;
    fontColor: string;
    fontAlign: string;
    fontRadius: string;
    fontColorBg: string;
  }>): void {
    // Обновляем свойства
    if (styles.fontSize !== undefined) this.fontSize = styles.fontSize;
    if (styles.fontName !== undefined) this.fontName = styles.fontName;
    if (styles.fontStyle !== undefined) this.fontStyle = styles.fontStyle;
    if (styles.fontColor !== undefined) this.fontColor = styles.fontColor;
    if (styles.fontAlign !== undefined) this.fontAlign = styles.fontAlign;
    if (styles.fontRadius !== undefined) this.fontRadius = styles.fontRadius;
    if (styles.fontColorBg !== undefined) this.fontColorBg = styles.fontColorBg;

    // Применяем все стили
    this.applyStyles();
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

  // Метод для удаления элемента и очистки обработчиков
  public destroy() {
    // Удаляем обработчики событий с document
    document.removeEventListener("mousemove", this.checkDragThreshold);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    
    // Удаляем элемент из DOM
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
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
