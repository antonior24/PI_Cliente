<template>
  <div class="container mt-5">
    <br>
    <h2>{{ t('aiSchedule.aiQueriesAboutSchedule') }}</h2>
    <div class="mb-3">
      <textarea v-model="pregunta" class="form-control" rows="4" :placeholder="t('aiSchedule.writeYourQuestion')"></textarea>
    </div>
    <button class="btn btn-primary" @click="consultar">{{ t('aiSchedule.send') }}</button>

    <div v-if="respuesta" class="mt-4">
      <h4>{{ t('aiSchedule.response') }}</h4>
      <p>{{ respuesta }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../composables/useI18n'

const pregunta = ref('')
const respuesta = ref('')
const auth = useAuthStore()
const { t } = useI18n()

async function consultar() {
  respuesta.value = ''
  try {
    const payload = { pregunta: pregunta.value }
    // si el usuario es administrador podría preguntar por otro profesor
    // aquí no usamos idProfesor, se podría añadir un campo adicional si se desea
    const resp = await axios.post('http://localhost:8081/api/horarios/ia', payload, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
    respuesta.value = resp.data
  } catch (err) {
    console.error('Error en consulta IA:', err)
    respuesta.value = err.response?.data || err.message
  }
}
</script>

<style scoped>
textarea {
  resize: vertical;
}
</style>
