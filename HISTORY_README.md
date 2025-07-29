# 📝 Система истории изменений (Undo/Redo)

Полноценная система отмены и повтора действий для графического редактора с возможностью возврата к начальному состоянию.

## 🎯 Основные возможности

- ✅ **Отмена действий** (Undo) - возврат к предыдущему состоянию
- ✅ **Повтор действий** (Redo) - восстановление отмененных изменений  
- ✅ **Сброс к начальному состоянию** - возврат к пустому холсту
- ✅ **Горячие клавиши** - быстрое управление с клавиатуры
- ✅ **Полное отслеживание изменений** - текст, свойства, позиция, размер
- ✅ **Детальная история** - каждое изменение записывается отдельно

## 🏗️ Архитектура

### Command Pattern
Система построена на паттерне "Команда" для обеспечения возможности отмены:

```typescript
interface Command {
  execute(): void;   // Выполнить действие
  undo(): void;      // Отменить действие  
  description: string; // Описание для UI
}
```

### Основные компоненты

```
src/utils/history.ts          # Ядро системы истории
├── Command                   # Интерфейс команд
├── AddElementCommand         # Команда добавления элемента
├── RemoveElementCommand      # Команда удаления элемента
├── ChangeTextCommand         # Команда изменения текста
├── ChangeTextPropertiesCommand  # Команда изменения свойств текста
├── ChangeIconPropertiesCommand  # Команда изменения свойств иконки
├── MoveElementCommand        # Команда перемещения элемента
├── ResizeElementCommand      # Команда изменения размера
├── HistoryManager           # Менеджер истории
└── Snapshot interfaces      # Интерфейсы для снимков состояния

src/components/HistoryControls.vue  # UI контролы истории
src/stores/InfoConstructor.ts       # Интеграция с Pinia store  
src/components/ICCanvas.vue          # Интеграция с холстом
```

## 🎮 Пользовательский интерфейс

### Индикаторы состояния
- **Активность кнопок** - неактивные кнопки когда действие невозможно

### Горячие клавиши
- **`Ctrl+Z`** - Отменить (Undo)
- **`Ctrl+Y`** - Повторить (Redo)  
- **`Ctrl+Shift+Z`** - Сброс к начальному состоянию

> **Примечание:** Горячие клавиши не срабатывают при редактировании текста (в input, textarea или contentEditable элементах).

## 🔧 Техническая реализация

### 1. Менеджер истории (HistoryManager)

```typescript
class HistoryManager {
  private history: Command[] = [];        // Стек команд
  private currentIndex: number = -1;      // Текущая позиция
  private initialSnapshot: CanvasSnapshot | null = null; // Начальное состояние
  
  executeCommand(command: Command): void  // Выполнить и добавить в историю
  undo(): boolean                        // Отменить действие
  redo(): boolean                        // Повторить действие
  resetToInitial(): boolean              // Сброс к начальному состоянию
}
```

### 2. Команды (Commands)

#### AddElementCommand
Добавляет элемент на холст с возможностью отмены:

```typescript
class AddElementCommand implements Command {
  execute(): void {
    this.canvasManager.addElementById(this.elementId, this.elementData);
  }
  
  undo(): void {
    this.canvasManager.removeElementById(this.elementId);
  }
}
```

#### RemoveElementCommand  
Удаляет элемент с холста с возможностью восстановления:

```typescript
class RemoveElementCommand implements Command {
  execute(): void {
    this.canvasManager.removeElementById(this.elementId);
  }
  
  undo(): void {
    this.canvasManager.addElementById(this.elementId, this.elementData);
  }
}
```

#### ChangeTextCommand
Изменяет содержимое текстового элемента:

```typescript
class ChangeTextCommand implements Command {
  execute(): void {
    this.canvasManager.changeElementText(this.elementId, this.newText);
  }
  
  undo(): void {
    this.canvasManager.changeElementText(this.elementId, this.oldText);
  }
}
```

#### ChangeTextPropertiesCommand / ChangeIconPropertiesCommand
Изменяют свойства элементов (размер шрифта, цвет):

```typescript
class ChangeTextPropertiesCommand implements Command {
  execute(): void {
    this.canvasManager.changeElementProperties(this.elementId, this.newProperties);
  }
  
  undo(): void {
    this.canvasManager.changeElementProperties(this.elementId, this.oldProperties);
  }
}
```

#### MoveElementCommand
Перемещает элемент на холсте:

```typescript
class MoveElementCommand implements Command {
  execute(): void {
    this.canvasManager.moveElement(this.elementId, this.newPosition);
  }
  
  undo(): void {
    this.canvasManager.moveElement(this.elementId, this.oldPosition);
  }
}
```

#### ResizeElementCommand
Изменяет размер элемента:

```typescript
class ResizeElementCommand implements Command {
  execute(): void {
    this.canvasManager.resizeElement(this.elementId, this.newSize);
  }
  
  undo(): void {
    this.canvasManager.resizeElement(this.elementId, this.oldSize);
  }
}
```

### 3. Снимки состояния (Snapshots)

Система использует снимки для сохранения состояния холста:

```typescript
interface CanvasSnapshot {
  elements: ElementSnapshot[];  // Все элементы на холсте
  timestamp: number;           // Время создания снимка
}

interface ElementSnapshot {
  id: string;                  // Уникальный ID элемента
  type: 'text' | 'icon';      // Тип элемента
  data: any;                  // Данные элемента (позиция, размер, содержимое)
}
```

## 📚 API и использование

### Основные методы store

```typescript

// Отменить последнее действие
store.undo(): boolean

// Повторить отмененное действие  
store.redo(): boolean

// Сброс к начальному состоянию
store.resetToInitial(canvasManager): boolean

// Получить информацию о текущем состоянии истории
store.getHistoryInfo(): {
  canUndo: boolean;
  canRedo: boolean; 
  canReset: boolean;
  currentIndex: number;
  totalCommands: number;
  nextUndoCommand?: string;
  nextRedoCommand?: string;
}
```

### Добавление новых команд

Для создания новой команды(действий):

1. **Реализуйте интерфейс Command:**
```typescript
class MyCustomCommand implements Command {
  description = "Моя команда";
  
  execute(): void {
    // Логика выполнения
  }
  
  undo(): void {
    // Логика отмены
  }
}
```

2. **Выполните через HistoryManager:**
```typescript
const command = new MyCustomCommand(params);
store.historyManager.executeCommand(command);
```

### Интеграция с холстом

Методы для работы с элементами в ICCanvas:

```typescript
// Добавить элемент по ID (используется командами)
addElementById(elementId: string, elementData: any): void

// Удалить элемент по ID (используется командами)  
removeElementById(elementId: string): void

// Создать снимок текущего состояния
createSnapshot(): CanvasSnapshot

// Загрузить состояние из снимка
loadSnapshot(snapshot: CanvasSnapshot): void

// Обновить отображение после изменений истории
refreshDisplay(): void

// Сброс к начальному состоянию
resetToInitial(): boolean

// Изменить текст элемента (используется командами)
changeElementText(elementId: string, newText: string): void

// Изменить свойства элемента (используется командами)
changeElementProperties(elementId: string, properties: any): void

// Переместить элемент (используется командами)
moveElement(elementId: string, position: { xPos: number; yPos: number }): void

// Изменить размер элемента (используется командами)
resizeElement(elementId: string, size: { width: number; height: number }): void
```


## 🚀 Производительность

### Оптимизации
- **Ленивое выполнение** - команды выполняются только при необходимости
- **Умное обновление** - перерисовка только измененных элементов
- **Ограничение истории** - можно добавить лимит на количество сохраняемых команд
- **Throttling** - предотвращение частых обновлений UI

### Рекомендации
- Используйте снимки только для критических состояний (начальное состояние)
- Предпочитайте команды снимкам для отдельных операций
- Очищайте историю при смене проекта: `store.historyManager.reset()`

## 🔍 Отладка и мониторинг

### Логирование
Система ведет подробные логи в консоли:
- Выполнение команд: `"Executed: Добавить текст. History length: 3"`
- Отмена действий: `"Undone: Добавить иконку. Current index: 1"`  
- Сброс состояния: `"Reset to initial state"`

### Отладочные методы
```typescript
// Получить всю историю команд
store.historyManager.getHistory(): Command[]

// Получить детальную информацию о состоянии
store.historyManager.getHistoryInfo()

// Проверить наличие начального снимка
store.historyManager.hasInitialState(): boolean
```


### Добавление новых типов элементов

При добавлении нового типа элемента:

1. Обновите типы в `history.ts`:
```typescript
interface ElementSnapshot {
  type: 'text' | 'icon' | 'shape';  // Добавьте новый тип
}
```

2. Обновите методы в `ICCanvas.vue`:
```typescript
addElementById(elementId: string, elementData: any) {
  if (elementData.type === 'shape') {
    // Логика создания нового типа элемента
  }
}
```

3. Обновите создание снимков:
```typescript
createSnapshot() {
  // Добавьте обработку нового типа
}
```

