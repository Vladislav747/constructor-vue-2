<template>
  <header>
    <div>This is the header</div>
    <div :class="$style.linkList">
      <router-link :to="{ name: 'home' }">index</router-link>
      <router-link :to="{ name: 'constructor' }">constructor</router-link>
    </div>
  </header>
</template>

<style module>
.linkList {
  display: flex;
  gap: 10px;
}
</style>