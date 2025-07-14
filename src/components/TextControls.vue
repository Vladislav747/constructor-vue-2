<template>
  <div>
    <textarea :class="$style.textarea" :value="store.textarea" @input="$event => handleInput($event)"></textarea>
  </div>
</template>

<script lang="ts">
import { useInfoConstructor } from '@/stores/InfoConstructor'

export default {
  data: () => ({
    store: useInfoConstructor()
  }),
  methods: {
    handleInput(event: Event) {
      event.preventDefault()
      const target = event.target as HTMLTextAreaElement
      if (target) {
        this.store.changeTextarea(target.value)
      }
    }
  },
}
</script>

<style module>
.textarea {
  resize: none;
}
</style>
