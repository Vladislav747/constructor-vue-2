<template>
  <div :class="$style.historyControls">
    <h3 :class="$style.title">История изменений</h3>
    
    <div :class="$style.buttonsRow">
      <button 
        :class="[$style.historyButton, $style.undoButton]"
        :disabled="!historyInfo.canUndo"
        @click="handleUndo"
        :title="`Отменить: ${historyInfo.nextUndoCommand || 'нет действий'}`"
      >
        <-
      </button>

      <!-- Кнопка Вперед (Redo) -->
      <button 
        :class="[$style.historyButton, $style.redoButton]"
        :disabled="!historyInfo.canRedo"
        @click="handleRedo"
        :title="`Повторить: ${historyInfo.nextRedoCommand || 'нет действий'}`"
      >
       ->
      </button>

      <!-- Кнопка Сброс -->
      <button 
        :class="[$style.historyButton, $style.resetButton]"
        :disabled="!historyInfo.canReset"
        @click="handleReset"
        title="Вернуться к начальному состоянию"
      >
        Сброс
      </button>
    </div>

    <!-- Подсказки горячих клавиш -->
    <div :class="$style.shortcuts">
      <div :class="$style.shortcut">
        <kbd>Ctrl+Z</kbd> - Отменить
      </div>
      <div :class="$style.shortcut">
        <kbd>Ctrl+Y</kbd> - Повторить  
      </div>
      <div :class="$style.shortcut">
        <kbd>Ctrl+Shift+Z</kbd> - Сброс
      </div>
      <div :class="$style.shortcut">
        <kbd>Delete</kbd> - Удалить элемент
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useInfoConstructor } from '@/stores/InfoConstructor';

export default {
  data() {
    return {
      store: useInfoConstructor(),
    };
  },
  computed: {
    historyInfo() {
      return this.store.getHistoryInfo();
    },
  },
  mounted() {
    // Добавляем обработчики горячих клавиш
    document.addEventListener('keydown', this.handleKeyDown);
  },
  beforeUnmount() {
    // Убираем обработчики горячих клавиш
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    handleUndo() {
      const success = this.store.undo();
      if (success) {
        this.$emit('history-changed', 'undo');
      }
    },

    handleRedo() {
      const success = this.store.redo();
      if (success) {
        this.$emit('history-changed', 'redo');
      }
    },

    handleReset() {
      // Эмитим событие для передачи canvasManager
      this.$emit('reset-to-initial');
    },

    handleKeyDown(event: KeyboardEvent) {
      // Проверяем что не находимся в поле ввода
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        if (event.shiftKey && event.key === 'Z') {
          // Ctrl+Shift+Z - Сброс
          event.preventDefault();
          this.handleReset();
        } else if (event.key === 'z' || event.key === 'Z') {
          // Ctrl+Z - Отменить
          event.preventDefault();
          this.handleUndo();
        } else if (event.key === 'y' || event.key === 'Y') {
          // Ctrl+Y - Повторить
          event.preventDefault();
          this.handleRedo();
        }
      }
    },
  },
};
</script>

<style module>
.historyControls {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #f9f9f9;
  margin-bottom: 16px;
}

.title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.buttonsRow {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.historyButton {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 36px;
}

.historyButton:hover:not(:disabled) {
  border-color: #007bff;
  background: #f8f9fa;
  transform: translateY(-1px);
}

.historyButton:active:not(:disabled) {
  transform: translateY(0);
}

.historyButton:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.undoButton:not(:disabled) {
  border-color: #28a745;
  color: #28a745;
}

.undoButton:hover:not(:disabled) {
  background: #d4edda;
  border-color: #1e7e34;
}

.redoButton:not(:disabled) {
  border-color: #007bff;
  color: #007bff;
}

.redoButton:hover:not(:disabled) {
  background: #d1ecf1;
  border-color: #0056b3;
}

.resetButton:not(:disabled) {
  border-color: #dc3545;
  color: #dc3545;
}

.resetButton:hover:not(:disabled) {
  background: #f8d7da;
  border-color: #c82333;
}

.infoText {
  font-size: 12px;
  color: #666;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.shortcuts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shortcut {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #777;
}

.shortcut kbd {
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 10px;
  margin-right: 8px;
  min-width: 80px;
  text-align: center;
}
</style> 