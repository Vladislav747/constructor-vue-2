<template>
  <div :class="$style.textControls">
    <!-- Поле ввода текста -->
    <div :class="$style.inputGroup">
      <label :class="$style.label">Текст:</label>
      <textarea 
        :class="$style.textarea" 
        :value="store.textarea" 
        @input="handleInput" 
        placeholder="Введите ваш текст"
      />
    </div>

    <!-- Размер шрифта -->
    <div :class="$style.inputGroup">
      <label :class="$style.label">Размер шрифта:</label>
      <div :class="$style.fontSizeControls">
        <input 
          type="range" 
          :class="$style.fontSizeSlider"
          :value="store.fontSize" 
          @input="handleFontSizeChange"
          min="8" 
          max="72" 
          step="1"
        />
        <div :class="$style.fontSizeDisplay">
          {{ store.fontSize }}px
        </div>
      </div>
    </div>


  </div>
</template>

<script lang="ts">
import { useInfoConstructor } from '@/stores/InfoConstructor';

export default {
  data: () => ({
    store: useInfoConstructor(),
  }),
  methods: {
    handleInput(event: Event) {
      event.preventDefault();
      const target = event.target as HTMLTextAreaElement;
      if (target) {
        this.store.changeTextarea(target.value);
      }
    },
    
    handleFontSizeChange(event: Event) {
      const target = event.target as HTMLInputElement;
      const newSize = parseInt(target.value);
      this.setFontSize(newSize);
    },
    
    setFontSize(size: number) {
      this.store.changeFontSize(size);
      // Эмитим событие изменения размера шрифта
      this.$emit('font-size-changed', size);
      console.log('Font size changed to:', size);
    },
  },
};
</script>

<style module>
.textControls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.textarea {
  resize: vertical;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.textarea:focus {
  outline: none;
  border-color: #007bff;
}

.fontSizeControls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.fontSizeSlider {
  flex: 1;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.fontSizeSlider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
}

.fontSizeSlider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.fontSizeDisplay {
  min-width: 45px;
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}


</style>
