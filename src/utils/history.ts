// Интерфейс для команд
export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

// Интерфейс для снимка состояния элемента
export interface ElementSnapshot {
  id: string;
  type: 'text' | 'icon';
  data: any;
}

// Интерфейс для снимка состояния холста
export interface CanvasSnapshot {
  elements: ElementSnapshot[];
  timestamp: number;
}

// Команда добавления элемента
export class AddElementCommand implements Command {
  description: string;
  private elementId: string;
  private elementData: any;
  private canvasManager: any;

  constructor(elementId: string, elementData: any, canvasManager: any) {
    this.elementId = elementId;
    this.elementData = elementData;
    this.canvasManager = canvasManager;
    this.description = `Добавить ${elementData.type === 'text' ? 'текст' : 'иконку'}`;
  }

  execute(): void {
    this.canvasManager.addElementById(this.elementId, this.elementData);
  }

  undo(): void {
    this.canvasManager.removeElementById(this.elementId);
  }
}

// Команда удаления элемента
export class RemoveElementCommand implements Command {
  description: string;
  private elementId: string;
  private elementData: any;
  private canvasManager: any;

  constructor(elementId: string, elementData: any, canvasManager: any) {
    this.elementId = elementId;
    this.elementData = elementData;
    this.canvasManager = canvasManager;
    this.description = `Удалить ${elementData.type === 'text' ? 'текст' : 'иконку'}`;
  }

  execute(): void {
    this.canvasManager.removeElementById(this.elementId);
  }

  undo(): void {
    this.canvasManager.addElementById(this.elementId, this.elementData);
  }
}

// Команда изменения текста
export class ChangeTextCommand implements Command {
  description: string;
  private elementId: string;
  private oldText: string;
  private newText: string;
  private canvasManager: any;

  constructor(elementId: string, oldText: string, newText: string, canvasManager: any) {
    this.elementId = elementId;
    this.oldText = oldText;
    this.newText = newText;
    this.canvasManager = canvasManager;
    this.description = `Изменить текст: "${oldText}" → "${newText}"`;
  }

  execute(): void {
    this.canvasManager.changeElementText(this.elementId, this.newText);
  }

  undo(): void {
    this.canvasManager.changeElementText(this.elementId, this.oldText);
  }
}

// Команда изменения свойств текста
export class ChangeTextPropertiesCommand implements Command {
  description: string;
  private elementId: string;
  private oldProperties: any;
  private newProperties: any;
  private canvasManager: any;

  constructor(elementId: string, oldProperties: any, newProperties: any, canvasManager: any) {
    this.elementId = elementId;
    this.oldProperties = oldProperties;
    this.newProperties = newProperties;
    this.canvasManager = canvasManager;
    
    const changedProps = Object.keys(newProperties).filter(key => 
      oldProperties[key] !== newProperties[key]
    );
    this.description = `Изменить свойства текста: ${changedProps.join(', ')}`;
  }

  execute(): void {
    this.canvasManager.changeElementProperties(this.elementId, this.newProperties);
  }

  undo(): void {
    this.canvasManager.changeElementProperties(this.elementId, this.oldProperties);
  }
}

// Команда изменения свойств иконки
export class ChangeIconPropertiesCommand implements Command {
  description: string;
  private elementId: string;
  private oldProperties: any;
  private newProperties: any;
  private canvasManager: any;

  constructor(elementId: string, oldProperties: any, newProperties: any, canvasManager: any) {
    this.elementId = elementId;
    this.oldProperties = oldProperties;
    this.newProperties = newProperties;
    this.canvasManager = canvasManager;
    
    const changedProps = Object.keys(newProperties).filter(key => 
      oldProperties[key] !== newProperties[key]
    );
    this.description = `Изменить свойства иконки: ${changedProps.join(', ')}`;
  }

  execute(): void {
    this.canvasManager.changeElementProperties(this.elementId, this.newProperties);
  }

  undo(): void {
    this.canvasManager.changeElementProperties(this.elementId, this.oldProperties);
  }
}

// Команда перемещения элемента
export class MoveElementCommand implements Command {
  description: string;
  private elementId: string;
  private oldPosition: { xPos: number; yPos: number };
  private newPosition: { xPos: number; yPos: number };
  private canvasManager: any;

  constructor(elementId: string, oldPosition: { xPos: number; yPos: number }, newPosition: { xPos: number; yPos: number }, canvasManager: any) {
    this.elementId = elementId;
    this.oldPosition = oldPosition;
    this.newPosition = newPosition;
    this.canvasManager = canvasManager;
    this.description = `Переместить элемент: (${oldPosition.xPos}, ${oldPosition.yPos}) → (${newPosition.xPos}, ${newPosition.yPos})`;
  }

  execute(): void {
    this.canvasManager.moveElement(this.elementId, this.newPosition);
  }

  undo(): void {
    this.canvasManager.moveElement(this.elementId, this.oldPosition);
  }
}

// Команда изменения размера элемента
export class ResizeElementCommand implements Command {
  description: string;
  private elementId: string;
  private oldSize: { width: number; height: number };
  private newSize: { width: number; height: number };
  private canvasManager: any;

  constructor(elementId: string, oldSize: { width: number; height: number }, newSize: { width: number; height: number }, canvasManager: any) {
    this.elementId = elementId;
    this.oldSize = oldSize;
    this.newSize = newSize;
    this.canvasManager = canvasManager;
    this.description = `Изменить размер: ${oldSize.width}×${oldSize.height} → ${newSize.width}×${newSize.height}`;
  }

  execute(): void {
    this.canvasManager.resizeElement(this.elementId, this.newSize);
  }

  undo(): void {
    this.canvasManager.resizeElement(this.elementId, this.oldSize);
  }
}

// Менеджер истории
export class HistoryManager {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private initialSnapshot: CanvasSnapshot | null = null;
  
  constructor() {
    this.reset();
  }

  // Сохранить начальное состояние
  saveInitialState(snapshot: CanvasSnapshot): void {
    this.initialSnapshot = snapshot;
    console.log('Initial state saved:', snapshot);
  }

  // Выполнить команду и добавить в историю
  executeCommand(command: Command): void {
    // Удаляем все команды после текущей позиции (если делали undo)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Выполняем команду
    command.execute();
    
    // Добавляем в историю
    this.history.push(command);
    this.currentIndex++;
    
    console.log(`Executed: ${command.description}. History length: ${this.history.length}`);
  }

  // Отменить последнее действие
  undo(): boolean {
    if (this.canUndo()) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      console.log(`Undone: ${command.description}. Current index: ${this.currentIndex}`);
      return true;
    }
    return false;
  }

  // Повторить отмененное действие
  redo(): boolean {
    if (this.canRedo()) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
      console.log(`Redone: ${command.description}. Current index: ${this.currentIndex}`);
      return true;
    }
    return false;
  }

  // Вернуться к начальному состоянию
  resetToInitial(canvasManager: any): boolean {
    if (this.initialSnapshot) {
      // Откатываем все изменения
      while (this.canUndo()) {
        this.undo();
      }
      
      // Применяем начальное состояние
      canvasManager.loadSnapshot(this.initialSnapshot);
      console.log('Reset to initial state');
      this.reset();
      return true;
    }
    return false;
  }

  // Проверки возможности действий
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  hasInitialState(): boolean {
    return this.initialSnapshot !== null;
  }

  // Получить информацию об истории
  getHistoryInfo(): {
    canUndo: boolean;
    canRedo: boolean;
    canReset: boolean;
    currentIndex: number;
    totalCommands: number;
    nextUndoCommand?: string;
    nextRedoCommand?: string;
  } {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      canReset: this.hasInitialState() && this.history.length > 0,
      currentIndex: this.currentIndex,
      totalCommands: this.history.length,
      nextUndoCommand: this.canUndo() ? this.history[this.currentIndex].description : undefined,
      nextRedoCommand: this.canRedo() ? this.history[this.currentIndex + 1].description : undefined,
    };
  }

  // Очистить историю
  reset(): void {
    this.history = [];
    this.currentIndex = -1;
    this.initialSnapshot = null;
    console.log('History reset');
  }

  // Получить текущую историю команд для отладки
  getHistory(): Command[] {
    return [...this.history];
  }
} 