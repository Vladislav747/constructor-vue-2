<template>
  <!-- Невидимый компонент для обработки клавиш -->
</template>

<script lang="ts">
export default {
  name: 'DeleteHandler',
  emits: ['delete-element'],
  
  mounted() {
    // Добавляем глобальный обработчик клавиш
    document.addEventListener('keydown', this.handleKeyDown);
  },
  
  beforeUnmount() {
    // Убираем обработчик при уничтожении компонента
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  
  methods: {
    handleKeyDown(event: KeyboardEvent) {
      // Проверяем что нажаты Delete или Backspace
      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return;
      }
      
      console.log('Delete key pressed:', event.key);
      
      // Проверяем что НЕ находимся в режиме редактирования текста
      if (this.isTextEditingActive()) {
        console.log('Text editing active, ignoring delete key');
        return;
      }
      
      // Предотвращаем стандартное поведение браузера
      event.preventDefault();
      event.stopPropagation();
      
      // Эмитим событие удаления
      this.$emit('delete-element', event.key);
    },
    
    isTextEditingActive(): boolean {
      const activeElement = document.activeElement as HTMLElement;
      
      // Проверяем различные случаи активного редактирования текста
      if (!activeElement) return false;
      
      // 1. Стандартные поля ввода
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        console.log('Input/textarea is active');
        return true;
      }
      
      // 2. ContentEditable элементы (наши текстовые блоки)
      if (activeElement.contentEditable === 'true') {
        console.log('ContentEditable element is active');
        return true;
      }
      
      // 3. Проверяем родительские элементы на contentEditable
      let parent = activeElement.parentElement;
      while (parent) {
        if (parent.contentEditable === 'true') {
          console.log('Parent contentEditable element is active');
          return true;
        }
        parent = parent.parentElement;
      }
      
      // 4. Проверяем по CSS классам наших текстовых элементов
      if (activeElement.classList.contains('divText') && 
          activeElement.contentEditable === 'true') {
        console.log('DivText element is being edited');
        return true;
      }
      
      // 5. Проверяем выделение текста (selection)
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // Если выделение находится внутри contentEditable элемента
        let element = container.nodeType === Node.TEXT_NODE 
          ? container.parentElement 
          : container as HTMLElement;
          
        while (element) {
          if (element.contentEditable === 'true') {
            console.log('Selection is inside contentEditable element');
            return true;
          }
          element = element.parentElement;
        }
      }
      
      return false;
    },
  },
};
</script> 