import { defineStore } from "pinia";
import { type ICMode } from "@/components/types";

export const useCounterStore = defineStore("IGConstructor", {
  state: (): {
    mode: ICMode;
    textarea: string;
  } => ({
    mode: "text",
    textarea: "Ваш текст",
  }),
  actions: {
    changeTextarea(value: string) {
      this.textarea = value;
    },
  },
});
