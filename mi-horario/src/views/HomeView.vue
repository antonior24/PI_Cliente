<template>
  <ModalCambioContraseña :visible="mostrarModal" @cerrar="mostrarModal = false" />
  <div class="mx-4" style="margin-top: 150px;">
    <!-- Evitar cargar todo el horario sin filtro en la pantalla inicial -->
    <div class="text-center">
      <p>Bienvenido. Selecciona un profesor para ver su horario.</p>
    </div>
  </div>

</template>




<script setup>
import { ref, onMounted } from 'vue'
import Horario from '../components/Horario.vue'
import ModalCambioContraseña from '../components/ModalCambioContraseña.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const mostrarModal = ref(false)

onMounted(() => {
  if (auth.usuario?.cambiarContraseña) {
    mostrarModal.value = true
  }
})

</script>
