<template>
  <footer class="footer-global text-white py-4 mt-5">
    <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center">
      <div class="d-flex align-items-center mb-3 mb-md-0">
        <img :src="logoSrc" alt="Logo IES Polígono Sur" height="50" class="me-3" />
        <div>
          <h5 class="mb-0">IES Polígono Sur</h5>
          <small>Sevilla, Andalucía</small>
        </div>
      </div>
      <div>
        <small>&copy; {{ new Date().getFullYear() }} - Todos los derechos reservados</small>
      </div>
    </div>
  </footer>
</template>

<script setup>
const logoSrc = new URL('../assets/logo_iespsur.jpeg', import.meta.url).href
</script>

<style scoped>
.footer-global {
  border-top: 4px solid #2e7d32;
  background: linear-gradient(to right, #81c784, #66bb6a);
  margin-top: auto; /* ayuda en flex layout */
  width: 100%;
}
</style>
