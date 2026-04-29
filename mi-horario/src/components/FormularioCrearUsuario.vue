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
      <label class="form-label">Roles (selecciona uno o más)</label>
      <div class="form-check">
        <input 
          class="form-check-input" 
          type="checkbox" 
          v-model="form.rolesSeleccionados" 
          value="profesor"
          id="rolProfesor"
        >
        <label class="form-check-label" for="rolProfesor">
          Profesor
        </label>
      </div>
      <div class="form-check">
        <input 
          class="form-check-input" 
          type="checkbox" 
          v-model="form.rolesSeleccionados" 
          value="administrador"
          id="rolAdmin"
        >
        <label class="form-check-label" for="rolAdmin">
          Equipo directivo / Admin
        </label>
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

const form = reactive({
  email: '',
  password: '',
  rolesSeleccionados: []
})

function guardar() {
  // Convertir los roles seleccionados a string separado por comas
  const rolesString = form.rolesSeleccionados.join(',')
  
  // Emitir los datos hacia el componente padre
  emit('guardar', {
    idProfesor: props.profesor.idProfesor,
    nombre: props.profesor.nombre,
    email: form.email,
    password: form.password,
    rol: rolesString
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