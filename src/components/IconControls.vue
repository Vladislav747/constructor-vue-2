<template>
  <div :class="$style.iconControls">
    <!-- Выбор цвета иконки -->
    <div :class="$style.inputGroup">
      <label :class="$style.label">Цвет иконки:</label>
      <div :class="$style.colorControls">
        <input 
          type="color" 
          :class="$style.colorPicker"
          :value="store.iconColor" 
          @input="handleColorChange"
        />
        <div :class="$style.colorDisplay">
          {{ store.iconColor.toUpperCase() }}
        </div>
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
  methods: {
    handleColorChange(event: Event) {
      const target = event.target as HTMLInputElement;
      this.setColor(target.value);
    },
    
    setColor(color: string) {
      this.store.changeIconColor(color);
      // Эмитим событие изменения цвета иконки
      this.$emit('icon-color-changed', color);
      console.log('Icon color changed to:', color);
    },
  },
};
</script>

<style module>
.iconControls {
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

.colorControls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.colorPicker {
  width: 50px;
  height: 40px;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  outline: none;
}

.colorPicker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.colorPicker::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.colorDisplay {
  min-width: 80px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #333;
  font-family: monospace;
}


</style> 