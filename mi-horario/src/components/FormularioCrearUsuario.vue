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
      <label class="form-label">Roles</label>
      <div v-for="rol in rolesDisponibles" :key="rol.value" class="form-check">
        <input
          class="form-check-input"
          type="checkbox"
          :id="`rol-${rol.value}`"
          :value="rol.value"
          v-model="form.roles"
        />
        <label class="form-check-label" :for="`rol-${rol.value}`">{{ rol.label }}</label>
      </div>
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

const rolesDisponibles = [
  { value: 'profesor', label: 'Profesor' },
  { value: 'administrador', label: 'Equipo directivo' }
]

const form = reactive({
  email: '',
  password: '',
  roles: []
})

function guardar() {
  // Emitir los datos hacia el componente padre
  emit('guardar', {
    idProfesor: props.profesor.idProfesor,
    nombre: props.profesor.nombre,
    email: form.email,
    password: form.password,
    rol: form.roles.join(',')
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