import { defineStore } from 'pinia';
import { type ICMode } from '@/components/types';
import { HistoryManager } from '@/utils/history';

export const useInfoConstructor = defineStore('IGConstructor', {
  state: (): {
    mode: ICMode;
    textarea: string;
    fontSize: number;
    iconColor: string;
    historyManager: HistoryManager;
  } => ({
    mode: 'text',
    textarea: 'Ваш текст',
    fontSize: 16,
    iconColor: '#333333',
    historyManager: new HistoryManager(),
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
    // История изменений
    undo(): boolean {
      return this.historyManager.undo();
    },
    redo(): boolean {
      return this.historyManager.redo();
    },
    resetToInitial(canvasManager: any): boolean {
      return this.historyManager.resetToInitial(canvasManager);
    },
    getHistoryInfo() {
      return this.historyManager.getHistoryInfo();
    },
  },
});
