<template>
  <MenuLateral />

  <div class="container py-4">
    <h2>Mis horarios</h2>

    <div v-if="!isProfesor" class="alert alert-warning mt-3">
      Acceso no autorizado. Solo usuarios con rol de profesor pueden ver esta página.
    </div>

    <div v-else>
      <Horario :mis-horarios="true" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MenuLateral from '../components/MenuLateral.vue'
import Horario from '../components/Horario.vue'

const auth = useAuthStore()
const router = useRouter()

const isProfesor = computed(() => {
  const rol = auth.usuario?.rol
  return Boolean(rol && String(rol).toLowerCase() === 'profesor')
})

onMounted(() => {
  if (!auth.logueado) {
    router.push('/login')
  } else if (!isProfesor.value) {
    router.push('/home')
  }
})

</script>

<style scoped>
.container {
  margin-top: 90px;
}
</style>
