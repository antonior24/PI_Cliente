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
      <label class="form-label">Roles (selecciona uno o más)</label>
      <div class="form-check">
        <input 
          class="form-check-input" 
          type="checkbox" 
          v-model="form.rolesSeleccionados" 
          value="profesor"
          id="editarRolProfesor"
        >
        <label class="form-check-label" for="editarRolProfesor">
          Profesor
        </label>
      </div>
      <div class="form-check">
        <input 
          class="form-check-input" 
          type="checkbox" 
          v-model="form.rolesSeleccionados" 
          value="administrador"
          id="editarRolAdmin"
        >
        <label class="form-check-label" for="editarRolAdmin">
          Equipo directivo / Admin
        </label>
      </div>
      <div class="text-danger" v-if="errores.rol">{{ errores.rol }}</div>
    </div>

    <div class="d-flex gap-2">
      <button class="btn btn-primary w-100" :disabled="props.isLoading" @click="enviar">
        {{ props.isLoading ? 'Guardando...' : 'Guardar cambios' }}
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
  password: '',  // La contrasena puede ser opcional
  rolesSeleccionados: []
})

// Usar un watcher para actualizar el formulario cada vez que cambie el profesor
watch(() => props.profesor, (nuevoProfesor) => {
  form.email = nuevoProfesor?.usuario?.email || '';  // Actualiza el email con los nuevos valores
  form.password = '';  // Puedes limpiar la contrasena si es necesario
  // Convertir el string de roles (separados por comas) en un array para los checkboxes
  const rolesString = nuevoProfesor?.usuario?.rol || '';
  form.rolesSeleccionados = rolesString ? rolesString.split(',').map(r => r.trim()) : [];
}, { immediate: true });  // Con 'immediate: true', se ejecutará también en la inicialización

// Función para emitir el evento
function enviar() {
  // Convertir los roles seleccionados a string separado por comas
  const rolesString = form.rolesSeleccionados.join(',')
  
  emit('actualizar', {
    idUsuario: props.profesor.usuario.id, // Usar el ID del profesor (usuario)
    nombre: props.profesor.nombre,          // Pasar el nombre del profesor (no del formulario)
    email: form.email,                      // Pasar el email desde el formulario
    rol: rolesString,                       // Pasar los roles como string separado por comas
    password: form.password || "",         // Si no hay contrasena, enviar una cadena vacia
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
