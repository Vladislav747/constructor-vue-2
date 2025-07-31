<template>
  <div :class="$style.wrapper">
    <ICCanvas ref="ICCanvas" :imgUrl="imgUrl" />
    <ICControls 
      :setImage="setImage" 
      :whenDownloadAsAnImage="downloadHtmlAsImage"
      @icon-selected="onIconSelected"
      @font-size-changed="onFontSizeChanged"
      @icon-color-changed="onIconColorChanged"
      @history-changed="onHistoryChanged"
      @reset-to-initial="onResetToInitial"
    />
    <!-- Глобальный обработчик клавиш удаления -->
    <DeleteHandler @delete-element="onDeleteElement" />
  </div>
</template>

<script lang="ts">
import ICCanvas from './ICCanvas.vue';
import ICControls from './ICControls.vue';
import DeleteHandler from './DeleteHandler.vue';
import type { SelectedIcon } from './types';

export default {
  components: {
    ICCanvas,
    ICControls,
    DeleteHandler,
  },
  data: () => ({
    imgUrl: '',
    selectedIcon: null as SelectedIcon | null,
  }),
  methods: {
    setImage(imgUrl: string) {
      this.imgUrl = imgUrl;
    },
    downloadHtmlAsImage() {
      const IICanvas = this.$refs.ICCanvas as InstanceType<typeof ICCanvas>;
      if (IICanvas) {
        IICanvas.downloadAsImage();
      }
    },
    onIconSelected(iconData: SelectedIcon) {
      this.selectedIcon = iconData;
      console.log('Icon selected in wrapper:', iconData);
      // Вызываем добавление иконки в центр холста
      this.addIconToCanvas(iconData);
    },
    
    addIconToCanvas(iconData: SelectedIcon) {
      const canvasRef = this.$refs.ICCanvas as InstanceType<typeof ICCanvas>;
      if (canvasRef && canvasRef.addIconToCenter) {
        canvasRef.addIconToCenter(iconData);
      }
    },
    
    onFontSizeChanged(fontSize: number) {
      console.log('Font size changed in wrapper:', fontSize);
      const canvasRef = this.$refs.ICCanvas as InstanceType<typeof ICCanvas>;
      if (canvasRef && canvasRef.updateSelectedTextFontSize) {
        canvasRef.updateSelectedTextFontSize(fontSize);
      }
    },
    
    onIconColorChanged(color: string) {
      console.log('Icon color changed in wrapper:', color);
      const canvasRef = this.$refs.ICCanvas as InstanceType<typeof ICCanvas>;
      if (canvasRef && canvasRef.updateSelectedIconColor) {
        canvasRef.updateSelectedIconColor(color);
      }
    },
    
    onHistoryChanged(action: string) {
      console.log('History action in wrapper:', action);
      const canvasRef = this.$refs.ICCanvas as InstanceType<typeof ICCanvas>;
      if (canvasRef) {
        // Обновляем отображение после изменения истории
        canvasRef.refreshDisplay();
      }
    },
    
    onResetToInitial() {
      console.log('Reset to initial in wrapper');
      const canvasRef = this.$refs.ICCanvas as InstanceType<typeof ICCanvas>;
      if (canvasRef && canvasRef.resetToInitial) {
        canvasRef.resetToInitial();
      }
    },
    
    onDeleteElement(keyPressed: string) {
      console.log('Delete element requested via key:', keyPressed);
      const canvasRef = this.$refs.ICCanvas as InstanceType<typeof ICCanvas>;
      if (canvasRef && canvasRef.deleteSelectedElement) {
        const success = canvasRef.deleteSelectedElement();
        if (success) {
          console.log('Element successfully deleted');
        } else {
          console.log('No element to delete or deletion failed');
        }
      }
    },
  },
};
</script>

<style module>
.wrapper {
  display: flex;
  width: 100%;
  gap: 32px;
}
</style>
