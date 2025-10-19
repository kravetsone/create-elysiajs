export function getAppVue(projectName: string) {
  return `<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <header>
  <h1>${projectName}</h1>
    <div class="wrapper bg-amber-400">
      <nav>
        <RouterLink to="/">Home</RouterLink>
      </nav>
    </div>
  </header>
  <Toaster />
  <RouterView />
</template>

<style scoped></style>`;
}
