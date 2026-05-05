<!-- src/components/Menu.vue -->
<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top w-100">
    <div class="container-fluid">

      <!-- Logo -->
      <router-link to="/home" class="navbar-brand d-flex align-items-center">
        <img :src="logo" alt="Logo" height="36" class="me-2" />

        <!-- Título completo en escritorio -->
        <span class="d-none d-lg-inline titulo-app">{{ t('app.fullTitle') }}</span>

        <!-- Título reducido en móvil -->
        <span class="d-inline d-lg-none titulo-app">{{ t('app.shortTitle') }}</span>
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










      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Items a la IZQUIERDA -->
        <ul class="navbar-nav me-auto">

          <!-- Inicio -->
          <li class="nav-item">
            <router-link class="nav-link" to="/home">{{ t('menu.home') }}</router-link>
          </li>

          <!-- Mis Ausencias -->
          <li class="nav-item">
            <router-link class="nav-link" to="/mis-ausencias">{{ t('menu.absences') }}</router-link>
          </li>

          <!-- Guardias -->
          <li class="nav-item">
            <router-link class="nav-link" to="/guardias">{{ t('menu.guards') }}</router-link>
          </li>

          <!-- DROPDOWN PARA ADMINISTRADOR -->
          <li v-if="auth.usuario?.rol?.toLowerCase() === 'administrador'" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              {{ t('menu.administration') }}
            </a>
            <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="adminDropdown">
              <li>
                <router-link class="dropdown-item" to="/datos-profesorado">
                  {{ t('menu.teacherData') }}
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/subir-archivo">
                  {{ t('menu.uploadData') }}
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/informes">
                  {{ t('menu.reports') }}
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="generarParteDiario">
                  {{ t('menu.dailyReports') }}
                </a>
              </li>
            </ul>
          </li>

        </ul>

        <!-- Items a la DERECHA -->
        <ul class="navbar-nav ms-auto">

          <!-- Horario IA -->
          <li class="nav-item">
            <router-link class="nav-link" to="/horario/ia">{{ t('menu.aiSchedule') }}</router-link>
          </li>

          <li class="nav-item d-flex align-items-center ms-2">
            <label class="text-white small me-2 d-none d-xl-inline">{{ t('menu.language') }}</label>
            <select class="form-select form-select-sm bg-dark text-white border-secondary" :value="locale"
              @change="setLocale($event.target.value)" aria-label="Seleccion de idioma" style="width: 90px;">
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </li>

          <!-- Descargar Horario PDF (solo si es profesor) -->
          <li v-if="auth.usuario?.rol?.toLowerCase() === 'profesor'" class="nav-item">
            <a class="nav-link" href="#" @click.prevent="descargarHorarioPDF">
              {{ t('menu.downloadSchedulePdf') }}
            </a>
          </li>

          <!-- DROPDOWN DE PERFIL -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="perfilDropdown" role="button"
              data-bs-toggle="dropdown" aria-expanded="false">

              <!-- Imagen -->
              <img :src="imagenPerfil || imagenPorDefecto" class="rounded-circle me-2"
                style="width: 32px; height: 32px; object-fit: cover;" />

              <!-- Nombre: comienza siempre alineado a la izquierda -->
              <span class="nombre-usuario d-none d-lg-inline" :title="auth.usuario.nombre">
                {{ auth.usuario.nombre }}
              </span>
            </a>

            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="perfilDropdown">
              <li>
                <router-link class="dropdown-item" to="/perfil">
                  {{ t('menu.myProfile') }}
                </router-link>
              </li>
              <li>
                <label for="inputFotoPerfil" class="dropdown-item" style="cursor: pointer;">
                  {{ t('menu.uploadProfileImage') }}
                </label>
                <input id="inputFotoPerfil" type="file" accept="image/*" @change="subirImagen" style="display: none;" />
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="mostrarModalPassword = true">
                  {{ t('menu.changePassword') }}
                </a>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="logout">
                  {{ t('menu.logout') }}
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
      <h5 class="mb-3"> {{ t('modal.changePassword') }}</h5>

      <div v-if="errorPassword" class="text-danger mb-2 text-start" style="font-size: 0.9rem;">
        {{ errorPassword }}
      </div>

      <input v-model="nuevaPassword" type="password" class="form-control mb-3" :placeholder="t('modal.newPassword')" />
      <input v-model="confirmacionPassword" type="password" class="form-control mb-3"
        :placeholder="t('modal.confirmPassword')" />

      <div class="d-flex justify-content-between">
        <button class="btn btn-secondary" @click="mostrarModalPassword = false">{{ t('modal.cancel') }}</button>
        <button class="btn btn-primary" @click="cambiarPassword">{{ t('modal.save') }}</button>
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
import api from '../axios'
import logo from '../assets/logo_iespsur.jpeg'
import { ref, onMounted } from 'vue'
import ModalMensaje from '../components/ModalMensaje.vue'
import { useI18n } from '../composables/useI18n'

const imagenPerfil = ref(null)
const cargando = ref(false)

const router = useRouter()
const auth = useAuthStore()
const { locale, setLocale, t } = useI18n()

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
    `/api/usuarios/${auth.usuario.id}/imagen`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    }
  ).then((response) => {
    console.log(' Respuesta del backend (imagen subida):', response)
    console.log('📨 response.data:', response.data)

    mostrarModal(t('modal.imageUploadedSuccess'), response.data, 'success')
    cargarImagenConToken()
  }).catch(err => {
    console.error('Error al subir imagen:', err)
    const mensaje = err.response?.data || t('modal.imageUploadError')
    mostrarModal(t('modal.imageUploadError'), mensaje, 'error')
  })
}


const imagenPorDefecto = 'https://img.freepik.com/vector-premium/icono-usuario-avatar-perfil-usuario-icono-persona-imagen-perfil-silueta-neutral-genero-adecuado_697711-1132.jpg'


async function cargarImagenConToken() {
  try {
    const response = await axios.get(
      `/api/usuarios/${auth.usuario.id}/imagen`,
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
    console.warn(t('modal.noImageFound'))
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
    errorPassword.value = t('modal.passwordMinLength')
    return
  }

  if (nuevaPassword.value !== confirmacionPassword.value) {
    errorPassword.value = t('modal.passwordsDoNotMatch')
    return
  }

  try {
    const response = await axios.put(
      `/api/usuarios/${auth.usuario.id}/cambiar-Contrasena`,
      { nuevaContrasena: nuevaPassword.value },
      {
        headers: { Authorization: `Bearer ${auth.token}` }
      }
    )

    console.log('Respuesta del backend:', response.data)

    // Actualiza auth si fuera necesario
    auth.usuario.cambiarContraseña = false
    localStorage.setItem('usuario', JSON.stringify(auth.usuario))

    mostrarModal(t('modal.passwordChangedSuccess'), t('modal.passwordChangedMessage'), 'success')
    mostrarModalPassword.value = false
    nuevaPassword.value = ''
    confirmacionPassword.value = ''
  } catch (err) {
    const mensaje = err.response?.data?.mensaje || t('modal.passwordChangeError')
    errorPassword.value = mensaje
    console.error('Error al cambiar contraseña:', err)
    mostrarModal(t('modal.passwordChangeError'), mensaje, 'error')
  }
}

async function generarParteDiario() {
  cargando.value = true
  try {
    const response = await api.get('/parte-ausencias')

    const base64PDF = response.data
    const byteCharacters = atob(base64PDF)
    const byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })

    // Formatear la fecha actual
    const fecha = new Date()
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const anio = fecha.getFullYear()
    const nombreArchivo = `parte-ausencias-${dia}-${mes}-${anio}.pdf`

    // Descargar el PDF con fecha en el nombre
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nombreArchivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    mostrarModal(t('modal.dailyReportSuccess'), t('modal.dailyReportSuccessMessage'), 'success')
  } catch (error) {
    console.error('Error al generar el parte diario:', error)
    mostrarModal(t('modal.dailyReportError'), t('modal.dailyReportErrorMessage'), 'error')
  } finally {
    cargando.value = false
  }
}

async function descargarHorarioPDF() {
  cargando.value = true
  try {
    const response = await api.get('/horarios/pdf/mis-horarios', {
      responseType: 'blob'
    })

    // Crear un blob con el PDF
    const blob = new Blob([response.data], { type: 'application/pdf' })

    // Obtener el nombre del archivo desde el header Content-Disposition si está disponible
    const contentDisposition = response.headers['content-disposition']
    let nombreArchivo = 'horario.pdf'
    
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename=([^;]+)/)
      if (matches && matches[1]) {
        nombreArchivo = matches[1].replace(/"/g, '')
      }
    }

    // Descargar el PDF
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nombreArchivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    mostrarModal(t('modal.scheduleDownloadSuccess'), t('modal.scheduleDownloadedMessage'), 'success')
  } catch (error) {
    console.error('Error al descargar el horario PDF:', error)
    let mensaje = t('modal.scheduleDownloadErrorMessage')
    if (error?.response?.data instanceof Blob) {
      try {
        const texto = await error.response.data.text()
        const json = JSON.parse(texto)
        mensaje = json?.error || json?.message || mensaje
      } catch (e) {
        mensaje = `Error ${error.response?.status || ''}`.trim() || mensaje
      }
    } else if (error?.response?.status) {
      mensaje = `Error ${error.response.status}`
    }
    mostrarModal(t('modal.scheduleDownloadError'), mensaje, 'error')
  } finally {
    cargando.value = false
  }
}
</script>


<style scoped>
/* Navbar general */
.navbar {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  height: 70px;
  z-index: 1055;
}

@media (min-width: 992px) {
  .navbar {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    height: 70px;
    z-index: 1055;
  }
}

/* Logo y marca */
.navbar-brand {
  font-weight: 600;
  font-size: 1.1rem;
}

/* Título de la app */
.titulo-app {
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Items del navbar */
.navbar-nav .nav-link {
  color: #fff !important;
  margin: 0 0.5rem;
  font-weight: 500;
}

.navbar-nav .nav-link.active {
  color: #0d6efd !important;
}

/* Dropdown menus */
.dropdown-menu {
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 0.5rem;
}

.dropdown-menu-dark {
  background-color: #2d3748;
}

.dropdown-menu-dark .dropdown-item {
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-menu-dark .dropdown-item:hover {
  background-color: #0d6efd;
  color: #fff;
}

.dropdown-menu-dark .dropdown-item.active,
.dropdown-menu-dark .dropdown-item:active {
  background-color: #0d6efd;
  color: #fff;
}

.dropdown-menu-dark .dropdown-divider {
  border-color: rgba(255, 255, 255, 0.1);
}

/* Nombre de usuario */
.nombre-usuario {
  font-size: 0.95rem;
  min-width: 100px;
  max-width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

/* Modal overlay */
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
