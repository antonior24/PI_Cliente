<template>
  <ModalCambioContraseña :visible="mostrarModal" @cerrar="mostrarModal = false" />
  <div class="mx-4" style="margin-top: 150px;">
    <!-- Mostrar horario del usuario logueado si es profesor -->
    <div v-if="esProfesor" class="container-fluid">
      <h2 class="mb-4">Mi Horario</h2>
      <Horario :mis-horarios="true" />
    </div>

    <!-- Mostrar mensaje para administradores -->
    <div v-else class="text-center">
      <p>Bienvenido. Selecciona un profesor para ver su horario.</p>
    </div>
  </div>

</template>




<script setup>
import { ref, computed, onMounted } from 'vue'
import Horario from '../components/Horario.vue'
import ModalCambioContraseña from '../components/ModalCambioContraseña.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const mostrarModal = ref(false)

const esProfesor = computed(() => {
  const rol = auth.usuario?.rol
  return Boolean(rol && String(rol).toLowerCase() === 'profesor')
})

onMounted(() => {
  if (auth.usuario?.cambiarContraseña) {
    mostrarModal.value = true
  }
})

</script>
