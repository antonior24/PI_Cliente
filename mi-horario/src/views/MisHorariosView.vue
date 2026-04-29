<template>
  <div class="container py-4">
    <h2>{{ t('schedule.mySchedulesTitle') }}</h2>

    <div v-if="!isProfesor" class="alert alert-warning mt-3">
      {{ t('schedule.unauthorized') }}
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
import Horario from '../components/Horario.vue'
import { useI18n } from '../composables/useI18n'

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

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
