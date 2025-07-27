<template>
  <div :class="$style.body">
    <div :class="$style.header">
      <button @click="whenDownloadAsAnImage()" :class="$style.downloadButton">
        Скачать
      </button>
    </div>
    
    <!-- Табы -->
    <div :class="$style.tabs">
      <button 
        :class="[$style.tab, { [$style.activeTab]: store.mode === 'text' }]"
        @click="switchToTextMode"
      >
        📝 Текст
      </button>
      <button 
        :class="[$style.tab, { [$style.activeTab]: store.mode === 'icon' }]"
        @click="switchToIconMode"
      >
        🎨 Иконки
      </button>
    </div>

    <!-- Контент табов -->
    <div :class="$style.tabContent">
      <!-- Таб "Текст" -->
      <div v-if="store.mode === 'text'" :class="$style.textTab">
        <h3 :class="$style.sectionTitle">Настройки текста</h3>
        <TextControls @font-size-changed="onFontSizeChanged" />
      </div>

      <!-- Таб "Иконки" -->
      <div v-if="store.mode === 'icon'" :class="$style.iconTab">
        <h3 :class="$style.sectionTitle">Настройки иконки</h3>
        <IconControls @icon-color-changed="onIconColorChanged" />
        
        <h3 :class="$style.sectionTitle">Выберите иконку</h3>
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

    <!-- Образцы изображений -->
    <div :class="$style.imagesSection">
      <h3 :class="$style.sectionTitle">Фоновые изображения</h3>
      <div :class="$style.imageButtons">
        <button @click="setImage('/img/perfect-3x4.jpg')" :class="$style.imageButton">
          Perfect 3x4
        </button>
        <button @click="setImage('/img/wide-greybg-macbook.jpg')" :class="$style.imageButton">
          Wide MacBook
        </button>
        <button @click="setImage('/img/narrow-macbook.jpg')" :class="$style.imageButton">
          Narrow MacBook
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import TextControls from './TextControls.vue';
import IconControls from './IconControls.vue';
import IconCommunity from './other/icons/IconCommunity.vue';
import IconDocumentation from './other/icons/IconDocumentation.vue';
import IconEcosystem from './other/icons/IconEcosystem.vue';
import IconSupport from './other/icons/IconSupport.vue';
import IconTooling from './other/icons/IconTooling.vue';
import { useInfoConstructor } from '@/stores/InfoConstructor';

export default {
  components: {
    TextControls,
    IconControls,
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
    switchToTextMode() {
      this.store.changeMode('text');
      this.activeIconName = ""; // Сбрасываем выбранную иконку
    },
    
    switchToIconMode() {
      this.store.changeMode('icon');
    },
    
    selectIcon(iconName: string) {
      console.log('Selected icon:', iconName);
      const currentIcon = this.icons.filter(({name}) => name === iconName);
      console.log(currentIcon, "currentIcon");
      this.activeIconName = currentIcon[0]?.name;
      
      // Убеждаемся что мы в режиме иконки
      if (this.store.mode !== 'icon') {
        this.store.changeMode('icon');
      }
      
      // Эмитим событие с данными иконки
      this.$emit('icon-selected', {
        iconName: iconName,
        iconComponent: currentIcon[0]?.component
      });
    },
    
    onFontSizeChanged(fontSize: number) {
      console.log('Font size changed in controls:', fontSize);
      // Эмитим событие наверх к ICWrapper
      this.$emit('font-size-changed', fontSize);
    },
    
    onIconColorChanged(color: string) {
      console.log('Icon color changed in controls:', color);
      // Эмитим событие наверх к ICWrapper
      this.$emit('icon-color-changed', color);
    },
  },
};
</script>

<style module>
.body {
  border: 4px solid #ABBCD51F;
  border-radius: 8px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.header {
  margin-bottom: 16px;
  text-align: center;
}

.downloadButton {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.downloadButton:hover {
  background: #218838;
}

/* Табы */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  border-bottom: 2px solid #f1f3f4;
}

.tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  font-weight: 500;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s ease;
  position: relative;
}

.tab:hover {
  background: #f8f9fa;
  color: #333;
}

.activeTab {
  background: #007bff !important;
  color: white !important;
}

.activeTab::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #007bff;
}

/* Контент табов */
.tabContent {
  min-height: 200px;
}

.textTab, .iconTab {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.sectionTitle {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* Иконки */
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

/* Изображения */
.imagesSection {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.imageButtons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.imageButton {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 14px;
}

.imageButton:hover {
  border-color: #007bff;
  background: #f8f9fa;
}
</style>
