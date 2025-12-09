<template>
  <div class="buscador-wrapper w-100" style="max-width: 500px;">
    <div class="input-group stylish-search">
      <span class="input-group-text bg-light border-0">
        <i class="bi bi-search text-dark"></i>
      </span>
      <input
        v-model="valorBusqueda"
        @input="emitirBusqueda"
        type="text"
        placeholder="Buscar profesor..."
        class="form-control border-0 shadow-none bg-light text-dark"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const valorBusqueda = ref('')

const emit = defineEmits(['buscar'])

function emitirBusqueda() {
  emit('buscar', valorBusqueda.value)
}
</script>

<style scoped>
.buscador-wrapper {
  margin: 2rem auto 1rem auto; /* margen superior, centrado horizontal, espacio debajo */
  padding: 0 1rem;
}


.stylish-search {
  border-radius: 40px;
  background-color: #f8f9fa;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.stylish-search:focus-within {
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.2);
}

.stylish-search input::placeholder {
  color: #6c757d;
  font-style: italic;
}

/* En móviles: input más pequeño si hace falta */
@media (max-width: 576px) {
  .stylish-search input {
    font-size: 0.9rem;
  }
}
</style>
