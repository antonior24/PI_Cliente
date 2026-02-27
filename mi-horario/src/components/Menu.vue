<!-- src/components/Menu.vue -->
<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top w-100 shadow">
    <div class="container-fluid">

      <!-- Logo -->
      <router-link to="/home" class="navbar-brand d-flex align-items-center">
        <img :src="logo" alt="Logo" height="36" class="me-2" />

        <!-- Título completo en escritorio -->
        <span class="d-none d-lg-inline titulo-app">Horario IES Polígono Sur</span>

        <!-- Título reducido en móvil -->
        <span class="d-inline d-lg-none titulo-app">Polígono Sur</span>
      </router-link>


      <!-- Botón de perfil solo en móvil -->
      <ul class="navbar-nav d-lg-none ms-auto">
        <li class="nav-item">
          <router-link to="/perfil" class="nav-link p-0">
            <img :src="imagenPerfil || imagenPorDefecto" class="rounded-circle me-2"
              style="width: 32px; height: 32px; object-fit: cover;" alt="Perfil" />
          </router-link>
        </li>
      </ul>










      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">

          <!-- DROPDOWN DE PERFIL -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="perfilDropdown" role="button"
              data-bs-toggle="dropdown" aria-expanded="false">

              <!-- Imagen -->
              <img :src="imagenPerfil || imagenPorDefecto" class="rounded-circle me-2"
                style="width: 32px; height: 32px; object-fit: cover;" />

              <!-- Nombre: comienza siempre alineado a la izquierda -->
              <span class="nombre-usuario" :title="auth.usuario.nombre">
                {{ auth.usuario.nombre }}
              </span>
            </a>

            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="perfilDropdown">
              <li>
                <label for="inputFotoPerfil" class="dropdown-item" style="cursor: pointer;">
                  👤 Subir foto de Perfil
                </label>
                <input id="inputFotoPerfil" type="file" accept="image/*" @change="subirImagen" style="display: none;" />
              </li>
              <label class="dropdown-item" href="#" @click.prevent="mostrarModalPassword = true">🔐 Cambiar
                contraseña</label>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                  🚪 Cerrar sesión
                </a>
              </li>
            </ul>
          </li>


        </ul>
      </div>
    </div>
  </nav>

  <!-- Modal cambio de contraseña -->
  <div v-if="mostrarModalPassword" class="modal-overlay">
    <div class="modal-content modal-warning">
      <h5 class="mb-3">🔐 Cambiar Contraseña</h5>

      <div v-if="errorPassword" class="text-danger mb-2 text-start" style="font-size: 0.9rem;">
        {{ errorPassword }}
      </div>

      <input v-model="nuevaPassword" type="password" class="form-control mb-3" placeholder="Nueva contraseña" />
      <input v-model="confirmacionPassword" type="password" class="form-control mb-3"
        placeholder="Confirmar contraseña" />

      <div class="d-flex justify-content-between">
        <button class="btn btn-secondary" @click="mostrarModalPassword = false">Cancelar</button>
        <button class="btn btn-primary" @click="cambiarPassword">Guardar</button>
      </div>
    </div>
  </div>


  <ModalMensaje :visible="modalVisible" :titulo="modalTitulo" :mensaje="modalMensaje" :tipo="modalTipo"
    @cerrar="cerrarModal" />

</template>

<script setup>
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import logo from '../assets/logo_iespsur.jpeg'
import { ref, onMounted } from 'vue'
import ModalMensaje from '../components/ModalMensaje.vue'

const imagenPerfil = ref(null)



const router = useRouter()
const auth = useAuthStore()

// 👇 Modal de mensajes
const modalVisible = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')
const modalTipo = ref('info')

function mostrarModal(titulo, mensaje, tipo = 'info') {
  modalTitulo.value = titulo
  modalMensaje.value = mensaje
  modalTipo.value = tipo
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
}

onMounted(() => {
  cargarImagenConToken()
})


function logout() {
  auth.logout()
  router.push('/login')
}

function subirImagen(event) {
  const archivo = event.target.files[0]
  if (!archivo) return

  const formData = new FormData()
  formData.append('imagen', archivo)

  axios.post(
    `http://localhost:8081/api/usuarios/${auth.usuario.id}/imagen`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    }
  ).then((response) => {
    console.log(' Respuesta del backend (imagen subida):', response)
    console.log('📨 response.data:', response.data)

    mostrarModal('Imagen subida', response.data, 'success')
    cargarImagenConToken()
  }).catch(err => {
    console.error('Error al subir imagen:', err)
    const mensaje = err.response?.data || 'Error al subir la imagen'
    mostrarModal('Error', mensaje, 'error')
  })
}


const imagenPorDefecto = 'https://img.freepik.com/vector-premium/icono-usuario-avatar-perfil-usuario-icono-persona-imagen-perfil-silueta-neutral-genero-adecuado_697711-1132.jpg'


async function cargarImagenConToken() {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/usuarios/${auth.usuario.id}/imagen`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        },
        responseType: 'arraybuffer',
        validateStatus: status => status === 200 // solo acepta 200 como válido
      }
    )

    const tipo = response.headers['content-type'] || 'image/jpeg'
    const base64 = btoa(
      new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
    imagenPerfil.value = `data:${tipo};base64,${base64}`
  } catch (error) {
    console.warn('No se encontró imagen. Usando imagen por defecto.')
    imagenPerfil.value = imagenPorDefecto
  }
}

const mostrarModalPassword = ref(false)
const nuevaPassword = ref('')
const confirmacionPassword = ref('')
const errorPassword = ref('')

async function cambiarPassword() {
  errorPassword.value = ''

  if (!nuevaPassword.value || nuevaPassword.value.length < 6) {
    errorPassword.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  if (nuevaPassword.value !== confirmacionPassword.value) {
    errorPassword.value = 'Las contraseñas no coinciden'
    return
  }

  try {
    const response = await axios.put(
      `http://localhost:8081/api/usuarios/${auth.usuario.id}/cambiar-Contrasena`,
      { nuevaContrasena: nuevaPassword.value },
      {
        headers: { Authorization: `Bearer ${auth.token}` }
      }
    )

    console.log('Respuesta del backend:', response.data)

    // Actualiza auth si fuera necesario
    auth.usuario.cambiarContraseña = false
    localStorage.setItem('usuario', JSON.stringify(auth.usuario))

    mostrarModal('Contraseña Modificada', 'Contraseña cambiada correctamente', 'success')
    mostrarModalPassword.value = false
    nuevaPassword.value = ''
    confirmacionPassword.value = ''
  } catch (err) {
    const mensaje = err.response?.data?.mensaje || 'Error al cambiar la contraseña'
    errorPassword.value = mensaje
    console.error('Error al cambiar contraseña:', err)
    mostrarModal('Error', mensaje, 'error')
  }
}



</script>


<style scoped>
/* Mostrar dropdown al pasar el mouse (solo en escritorio) */
@media (min-width: 992px) {
  .navbar {
  padding-left: 1rem;
  padding-right: 1rem;
  height: 64px;
  z-index: 1055; /* Añade esto */
}


}

/* Centrar dropdown en móviles y alinear mejor */
.dropdown-menu {
  right: 0;
  left: auto;
  transform: none;

}

/* Logo y título bien alineados */
.navbar-brand {
  display: flex;
  align-items: center;
}

.navbar-brand img {
  height: 36px;
  width: auto;
}

/* Nombre del usuario con truncamiento */
.nombre-usuario {
  font-size: 0.95rem;
  min-width: 100px;
  /* Espacio mínimo reservado */
  max-width: auto;
  /* No crecer más allá de esto */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  /* Asegura que respeta el ancho */
}



/* Ajustes de navbar general */
.navbar {
  padding-left: 1rem;
  padding-right: 1rem;
  height: 64px;
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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
  text-align: center;
}

.modal-warning {
  border-left: 8px solid #ffc107;
}
</style>
