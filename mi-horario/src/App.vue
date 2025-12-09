<template>
  <div class="app-container">
    <Menu v-if="showMenu && auth.logueado" />
    <main class="main-content">
      <router-view />
    </main>
    <Footer v-if="showMenu && auth.logueado" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'

import Menu from './components/Menu.vue'
import Footer from './components/Footer.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const route = useRoute()
const auth = useAuthStore()

const showMenu = computed(() => route.path !== '/login')
</script>

<style>
/* Layout principal */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Contenido principal que crece */
.main-content {
  flex: 1;
}
body{
  overflow: auto !important;
}
</style>
