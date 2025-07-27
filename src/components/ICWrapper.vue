<template>
  <div :class="$style.wrapper">
    <ICCanvas ref="ICCanvas" :imgUrl="imgUrl" />
    <ICControls 
      :setImage="setImage" 
      :whenDownloadAsAnImage="downloadHtmlAsImage"
      @icon-selected="onIconSelected"
      @font-size-changed="onFontSizeChanged"
      @icon-color-changed="onIconColorChanged"
    />
  </div>
</template>

<script lang="ts">
import ICCanvas from './ICCanvas.vue';
import ICControls from './ICControls.vue';
import type { SelectedIcon } from './types';

export default {
  components: {
    ICCanvas,
    ICControls,
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
