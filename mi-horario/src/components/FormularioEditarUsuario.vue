<template>
  <div class="formulario-container">
    <h6 class="titulo-centrado">
      Modificar usuario para:
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
      <button class="btn btn-primary w-100" :disabled="isLoading" @click="enviar">
        {{ isLoading ? 'Guardando...' : 'Guardar cambios' }}
      </button>
    </div>
  </div>
</template>



<script setup>
import { reactive, watch } from 'vue'

const emit = defineEmits();


const props = defineProps({
  profesor: Object,   // Recibe el objeto completo del profesor
  errores: Object,
  isLoading: Boolean
})

const form = reactive({
  email: props.profesor.usuario.email ,
  password: '',  // La contraseña puede ser opcional
  rol: props.profesor.usuario.rol
})

// Usar un watcher para actualizar el formulario cada vez que cambie el profesor
watch(() => props.profesor, (nuevoProfesor) => {
  form.email = nuevoProfesor?.usuario?.email || '';  // Actualiza el email con los nuevos valores
  form.password = '';  // Puedes limpiar la contraseña si es necesario
  form.rol = nuevoProfesor?.usuario?.rol || '';  // Actualiza el rol
}, { immediate: true });  // Con 'immediate: true', se ejecutará también en la inicialización

// Función para emitir el evento
function enviar() {
  emit('actualizar', {
    idUsuario: props.profesor.usuario.id, // Usar el ID del profesor (usuario)
    nombre: props.profesor.nombre,          // Pasar el nombre del profesor (no del formulario)
    email: form.email,                      // Pasar el email desde el formulario
    rol: form.rol,                          // Pasar el rol desde el formulario
    password: form.password || "",         // Si no hay contraseña, enviar una cadena vacía
  });
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
