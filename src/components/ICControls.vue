<template>
  <div :class="$style.body">
    controls
    <button @click="whenDownloadAsAnImage()">
      download
    </button>
    <br>
    <br>
    <button @click="setImage('/img/perfect-3x4.jpg')">
      perfect-3x4
    </button>
    <button @click="setImage('/img/wide-greybg-macbook.jpg')">
      wide-greybg-macbook
    </button>
    <button @click="setImage('/img/narrow-macbook.jpg')">
      narrow-macbook
    </button>
     <br>
      <br>
    <TextControls />
    <br>
    <div :class="$style.iconsSection">
      <h3>Иконки:</h3>
      <div :class="$style.iconsList">
        <button 
          v-for="icon in icons" 
          :key="icon.name"
          :class="[
            $style.iconButton, 
            { [$style.activeIcon]: icon.name === activeIconName }
          ]"
          @click="selectIcon(icon.name)"
        >
          <component :is="icon.component" />
          <span>{{ icon.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TextControls from './TextControls.vue';
import IconCommunity from './other/icons/IconCommunity.vue';
import IconDocumentation from './other/icons/IconDocumentation.vue';
import IconEcosystem from './other/icons/IconEcosystem.vue';
import IconSupport from './other/icons/IconSupport.vue';
import IconTooling from './other/icons/IconTooling.vue';
import { useInfoConstructor } from '@/stores/InfoConstructor';

export default {
  components: {
    TextControls,
    IconCommunity,
    IconDocumentation,
    IconEcosystem,
    IconSupport,
    IconTooling,
  },
  props: {
    setImage: {
      type: Function,
      required: true,
    },
    whenDownloadAsAnImage: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      store: useInfoConstructor(),
      icons: [
        { name: 'Community', component: 'IconCommunity' },
        { name: 'Documentation', component: 'IconDocumentation' },
        { name: 'Ecosystem', component: 'IconEcosystem' },
        { name: 'Support', component: 'IconSupport' },
        { name: 'Tooling', component: 'IconTooling' },
      ],
      activeIconName: "",
    };
  },
  methods: {
    selectIcon(iconName: string) {
      console.log('Selected icon:', iconName);
      const currentIcon = this.icons.filter(({name}) => name === iconName);
      console.log(currentIcon, "currentIcon");
      this.activeIconName = currentIcon[0]?.name;
      
      // Переключаем в режим иконки
      this.store.changeMode('icon');
      
      // Эмитим событие с данными иконки
      this.$emit('icon-selected', {
        iconName: iconName,
        iconComponent: currentIcon[0]?.component
      });
    },
  },
};
</script>

<style module>
.body {
  border: 4px solid #ABBCD51F;
  border-radius: 4px;
  padding: 16px;
}

.iconsSection {
  margin-top: 16px;
}

.iconsSection h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
}

.iconsList {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.iconButton {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.iconButton:hover {
  border-color: #007bff;
  background: #f8f9fa;
  transform: translateY(-1px);
}

.iconButton span {
  font-size: 12px;
  text-align: center;
  color: #666;
}

.activeIcon {
  border-color: #007bff !important;
  background: #e3f2fd !important;
}

.activeIcon svg {
  color: #007bff;
}
</style>
