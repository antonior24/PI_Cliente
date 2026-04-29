<template>
  <ModalCambioContraseña :visible="mostrarModal" @cerrar="mostrarModal = false" />
  <div class="mx-4" style="margin-top: 150px;">
    <!-- Mostrar horario del usuario logueado si es profesor -->
    <div v-if="esProfesor" class="container-fluid">
      <h2 class="mb-4">{{ t('views.homeMySchedule') }}</h2>
      <Horario :mis-horarios="true" />
    </div>

    <!-- Mostrar mensaje para administradores -->
    <div v-else class="text-center">
      <p>{{ t('views.homeWelcome') }}</p>
    </div>
  </div>

</template>




<script setup>
import { ref, computed, onMounted } from 'vue'
import Horario from '../components/Horario.vue'
import ModalCambioContraseña from '../components/ModalCambioContraseña.vue'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../composables/useI18n'

const auth = useAuthStore()
const mostrarModal = ref(false)
const { t } = useI18n()

const esProfesor = computed(() => {
  const rol = auth.usuario?.rol
  // Verifica si tiene el rol de profesor (puede ser "profesor" o "profesor,administrador" o "administrador,profesor")
  return Boolean(rol && String(rol).toLowerCase().includes('profesor'))
})

onMounted(() => {
  if (auth.usuario?.cambiarContraseña) {
    mostrarModal.value = true
  }
})

</script>
