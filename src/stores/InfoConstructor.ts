import { defineStore } from 'pinia';
import { type ICMode } from '@/components/types';

export const useInfoConstructor = defineStore('IGConstructor', {
  state: (): {
    mode: ICMode;
    textarea: string;
    fontSize: number;
    iconColor: string;
  } => ({
    mode: 'text',
    textarea: 'Ваш текст',
    fontSize: 16,
    iconColor: '#333333',
  }),
  actions: {
    changeTextarea(value: string) {
      this.textarea = value;
    },
    changeMode(mode: ICMode) {
      this.mode = mode;
    },
    changeFontSize(size: number) {
      this.fontSize = size;
    },
    changeIconColor(color: string) {
      this.iconColor = color;
    },
  },
});
