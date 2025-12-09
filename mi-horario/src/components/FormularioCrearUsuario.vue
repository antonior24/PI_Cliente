<template>
  <div class="formulario-container">
    <h6 class="titulo-centrado">
      Crear usuario para:
    </h6>
    <p class="titulo-centrado fw-bold ">
      {{ profesor.nombre }}
    </p>


    <div class="mb-2">
      <label class="form-label">Email</label>
      <input type="email" class="form-control" v-model="form.email" placeholder="correo@ejemplo.com" />
      <div class="text-danger" v-if="errores.email">{{ errores.email }}</div>
    </div>

    <div class="mb-3">
      <label class="form-label">Contraseña</label>
      <input type="password" class="form-control" v-model="form.password" placeholder="••••••" />
      <div class="text-danger" v-if="errores.contraseña">{{ errores.contraseña }}</div>
    </div>

    <div class="mb-3">
      <label class="form-label">Rol</label>
      <select class="form-select" v-model="form.rol">
        <option disabled value="">Selecciona un rol</option>
        <option value="profesor">Profesor</option>
        <option value="administrador">Equipo directivo</option>
      </select>
      <div class="text-danger" v-if="errores.rol">{{ errores.rol }}</div>
    </div>

    <div class="d-flex gap-2">
      <button class="btn btn-primary w-100" :disabled="isLoading" @click="guardar">
        {{ isLoading ? 'Guardando...' : 'Guardar usuario' }}
      </button>

    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  profesor: Object,
  errores: Object,
  isLoading: Boolean
})

const emit = defineEmits('guardar')

const form = reactive({
  email: '',
  password: '',
  rol: ''
})

function guardar() {
  // Emitir los datos hacia el componente padre
  emit('guardar', {
    idProfesor: props.profesor.idProfesor,
    nombre: props.profesor.nombre,
    email: form.email,
    password: form.password,
    rol: form.rol
  })
}


</script>


<style scoped>
.formulario-container {
  background-color: #f8f9fa;
  width: 400px;
  min-height: 430px;
  padding: 1.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
}

.titulo-centrado {
  text-align: center;
}
</style>