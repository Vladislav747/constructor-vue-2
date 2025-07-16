<template>
  <div :class="$style.wrapper">
    <ICCanvas ref="ICCanvas" :imgUrl="imgUrl" />
    <ICControls :setImage="setImage" :whenDownloadAsAnImage="downloadHtmlAsImage" />
  </div>
</template>

<script lang="ts">
import ICCanvas from './ICCanvas.vue';
import ICControls from './ICControls.vue';

export default {
  components: {
    ICCanvas,
    ICControls,
  },
  data: () => ({
    imgUrl: '',
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
