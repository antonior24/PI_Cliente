<template>
  <MenuLateral />

  <div class=" mt-5 pt-4 px-3">

    <div class="mb-4 d-flex justify-content-center mt-5" style="margin-top: 200px;">
  <BuscadorProfesores @buscar="buscarProfesoresDesdeEvento" />
</div>



    <!-- Contenedor centrado con formulario flotante -->
    <div class="main-wrapper d-flex justify-content-center align-items-start w-100 position-relative">

      <!-- Lista de Profesores -->
      <div>
        <div d-flex flex-column align-items-center me-3>
          <TarjetaProfesor v-for="profesor in resultados" :key="profesor.idProfesor" :profesor="profesor"
            :profesorSeleccionado="profesorSeleccionado" :formulario="formularios[profesor.idProfesor] || {}"
            :errores="erroresFormulario" :isLoading="isLoading" @toggleFormulario="mostrarFormularioCrear"
            @guardarUsuario="guardarUsuario" @cancelarFormulario="cancelarFormulario" @eliminarUsuario="eliminarUsuario"
            @imagenSubida="obtenerTodosLosProfesores" @modificarUsuario="modificarUsuario"
            @verDetalles="irADetallesUsuario" :class="{
              'espacio-formulario-movil': profesorSeleccionado && isMobile
            }" />
        </div>
      </div>
    </div>

  </div>

  <ModalMensaje :visible="modal.visible" :titulo="modal.titulo" :mensaje="modal.mensaje" :tipo="modal.tipo"
    @cerrar="cerrarModal" />
</template>



<script setup>
import MenuLateral from '../components/MenuLateral.vue'
import BuscadorProfesores from '../components/BuscadorProfesores.vue'
import TarjetaProfesor from '../components/TarjetaProfesor.vue'
import ModalMensaje from '../components/ModalMensaje.vue'

import { useRouter } from 'vue-router'


import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const busqueda = ref('')
const resultados = ref([])
const profesorSeleccionado = ref(null)  // Solo el ID del profesor
const formularios = ref({})
const isLoading = ref(false)
const erroresFormulario = ref({})
const action = ref('')  // Asegúrate de que action sea un ref
const router = useRouter()



// Al entrar en la pagina automaticamente
onMounted(() => {
  obtenerTodosLosProfesores()
})


function mostrarFormularioCrear({ profesorId, action: actionType }) {
  const anchoPantalla = window.innerWidth
  if (anchoPantalla <= 768) {
    // En móvil redirigimos
    window.location.href = `/formulario/${profesorId}?action=${actionType}`
  } else {
    // En escritorio mostramos el formulario flotante
    if (profesorSeleccionado.value === profesorId) {
      profesorSeleccionado.value = null
      action.value = ''
      erroresFormulario.value = {}
    } else {
      profesorSeleccionado.value = profesorId
      action.value = actionType
      erroresFormulario.value = {}
    }
  }
}


// Modal genérico
const modal = ref({
  visible: false,
  titulo: '',
  mensaje: '',
  tipo: 'info'
})

function mostrarModal(titulo, mensaje, tipo = 'info') {
  modal.value = {
    visible: true,
    titulo,
    mensaje,
    tipo
  }
}

function cerrarModal() {
  modal.value.visible = false
}


// Buscar desde componente hijo
function buscarProfesoresDesdeEvento(valor) {
  busqueda.value = valor
  buscarProfesores()
}

// Buscar profesores
async function buscarProfesores() {
  if (busqueda.value.trim().length < 2) {
    obtenerTodosLosProfesores()
    return
  }

  try {
    const response = await axios.get(
      `http://localhost:8081/api/profesores/buscar?nombre=${encodeURIComponent(busqueda.value)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    resultados.value = response.data
  } catch (error) {
    console.error('Error al buscar profesores:', error)
  }
}

// Obtener todos los profesores
async function obtenerTodosLosProfesores() {
  try {
    const response = await axios.get('http://localhost:8081/api/profesores', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    // console.log('📚 Todos los profesores:', response.data)
    resultados.value = response.data
  } catch (error) {
    console.error('Error al obtener profesores:', error)
  }
}

// Cerrar formulario
function cancelarFormulario() {
  profesorSeleccionado.value = null
  action.value = ''  // Resetear la acción
}


async function guardarUsuario(datosFormulario) {
  const { idProfesor, email, password, rol, nombre } = datosFormulario;

  if (!email || !password || !rol || !nombre) {
    mostrarModal(' Campos incompletos', 'Por favor, completa todos los campos.', 'warning');
    return;
  }

  const payload = {
    idProfesor,
    nombre,
    email,
    contraseña: password,
    rol
  };

  console.log("Payload que se enviará:", payload);

  isLoading.value = true;

  try {
    const response = await axios.post(
      `http://localhost:8081/api/usuarios/crear-con-profesor/${idProfesor}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Respuesta del servidor:", response);
    mostrarModal(' Usuario creado', `Se ha vinculado correctamente a ${nombre}`, 'success');
    profesorSeleccionado.value = null;
    obtenerTodosLosProfesores();

  } catch (error) {
    if (error.response) {
      console.error('Error en la respuesta del servidor:', error.response);

      // Solo pasar los errores al formulario si son validaciones
      if (error.response.status === 400 && error.response.data) {
        console.log("Errores de validación:", error.response.data);
        erroresFormulario.value = error.response.data; // Mostrar solo errores de validación
      } else {
        // Si es otro tipo de error, mostrar el modal de error
        mostrarModal(' Error', 'Ese usuario ya existe.', 'error');
      }
    } else {
      console.error("Error desconocido:", error);
      mostrarModal(' Error', 'Ocurrió un error inesperado.', 'error');
    }
  } finally {
    isLoading.value = false;
  }
}


// Función para borrar usuario
async function eliminarUsuario(profesor) {
  console.log("ID del usuario a eliminar:", profesor.usuario.id)

  if (!confirm(`¿Estás seguro de eliminar el usuario vinculado a ${profesor.nombre}?`)) return

  try {
    await axios.delete(`http://localhost:8081/api/usuarios/${profesor.usuario.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    mostrarModal(' Usuario eliminado', `El usuario de ${profesor.nombre} ha sido eliminado.`, 'success')
    obtenerTodosLosProfesores()
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    mostrarModal(' Error', 'No se pudo eliminar el usuario.', 'error')
  }
}




// Modificar usuario
async function modificarUsuario(datosFormulario) {
  const { idUsuario, email, password, rol, nombre } = datosFormulario;
  // Asegúrate de que el idUsuario no sea nulo o indefinido
  console.log(idUsuario + email + password + rol + nombre)
  if (!idUsuario) {
    mostrarModal(' Error', 'El ID del usuario no puede ser nulo.', 'error');
    return;
  }

  const payload = {
    idUsuario,     // Cambiado a idUsuario
    nombre,
    email,
    contraseña: password,
    rol
  };

  console.log("Datos a enviar al backend:", payload);

  isLoading.value = true;

  try {
    const response = await axios.put(
      `http://localhost:8081/api/usuarios/${idUsuario}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Respuesta del servidor:", response);
    mostrarModal(' Usuario modificado', `Se ha modificado correctamente a ${nombre}`, 'success');
    profesorSeleccionado.value = null;
    obtenerTodosLosProfesores();
  } catch (error) {

    // Manejo de errores
    if (error.response) {
      console.error('Error en la respuesta del servidor:', error.response);

      // Solo pasar los errores al formulario si son validaciones
      if (error.response.status === 400 && error.response.data) {
        console.log("Errores de validación:", error.response.data);
        erroresFormulario.value = error.response.data; // Mostrar solo errores de validación

      } else {
        // Si es otro tipo de error
        mostrarModal(' Error', 'El usuario ya existe o hay otro error.', 'error');
      }
    } else {
      console.error("Error desconocido:", error);
      mostrarModal(' Error', 'Ocurrió un error inesperado.', 'error');
    }

  } finally {
    isLoading.value = false;
  }

}


function irADetallesUsuario(idProfesor) {
  router.push(`/datosusuario/${idProfesor}`)
}




</script>





<style scoped>
/* En móviles, añade más separación desde arriba */
@media (max-width: 800px) {
  .main-content {
    margin-top: 130px !important;
  }
}

/* Estilo del buscador */
.stylish-search {
  border-radius: 40px;
  background-color: #f8f9fa;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.stylish-search:focus-within {
  box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.2);
}

.stylish-search input::placeholder {
  color: #6c757d;
  font-style: italic;
}

/* Scroll tarjetas */
.scrollable-profesores {
  max-height: 66vh;
  overflow-y: auto;
  width: 100%;
}

/* Para la barra vertical */
/* .scrollable-profesores::-webkit-scrollbar {
  display: none;
} */

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 12px;
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* Transición */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.main-wrapper {
  position: relative;
  width: 100%;
  max-width: none;
  /* opcional, si querés quitar el límite */
}


/* Formulario flotante */
.formulario-flotante {
  position: absolute;
  top: 180px;
  right: 100px;
  width: 400px;
  z-index: 10;
}
</style>
