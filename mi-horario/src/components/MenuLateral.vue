<template>
  <!-- Botón tipo "bocadillo" -->
  <div class="position-fixed top-0 start-0 z-3" style="margin-top: 80px; margin-left: 12px;">
    <button class="btn btn-outline-light bg-dark border-0 shadow" type="button" data-bs-toggle="offcanvas"
      data-bs-target="#sidePanel" style="font-size: 1.5rem; padding: 8px 16px;">
      &#9776;
    </button>
  </div>

  <!-- Overlay de carga -->
  <div v-if="cargando"
    class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
    style="z-index: 1050">
    <div class="text-center text-white">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">{{ t('modal.uploadingFile') }}</span>
      </div>
      <p class="mt-3">{{ t('modal.uploadingFile') }}</p>
    </div>
  </div>

  <!-- Overlay invisible para cerrar al clic fuera -->
  <div v-if="menuAbierto" class="overlay-invisible" @click="cerrarMenuAlClic"></div>

  <!-- Offcanvas lateral -->
  <div class="offcanvas offcanvas-start" tabindex="-1" id="sidePanel" aria-labelledby="sidePanelLabel"
    data-bs-backdrop="false" data-bs-keyboard="false">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="sidePanelLabel">{{ t('modal.lateralMenuTitle') }}</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" :aria-label="t('modal.closeButtonLabel')"></button>
    </div>

    <div class="offcanvas-body">
      <input ref="fileInput" type="file" @change="subirArchivoSelec" style="display: none" />

      <router-link to="/home" class="btn btn-primary w-100 mb-2" @click="cerrarOffcanvas">{{ t('modal.sidemenuHome') }}</router-link>

      <div v-if="auth.usuario?.rol?.toLowerCase() === 'administrador'">
        <router-link to="/subir-archivo" class="btn btn-primary w-100 mb-2" @click="cerrarOffcanvas">{{ t('modal.sidemenuUploadData') }}</router-link>
        <router-link to="/datos-profesorado" class="btn btn-primary w-100 mb-2" @click="cerrarOffcanvas">{{ t('modal.sidemenuTeacherData') }}</router-link>
        <button class="btn btn-primary w-100 mb-2" @click="generarParteDiario">
          {{ t('menu.dailyReports') }}
        </button>

      </div>

      <div v-if="auth.usuario?.rol?.toLowerCase() === 'profesor'">
        <router-link to="/mis-horario" class="btn btn-primary w-100 mb-2" @click="cerrarOffcanvas">
          {{ t('modal.sidemenuMySchedules') }}
        </router-link>
        <button class="btn btn-primary w-100 mb-2" @click="descargarHorarioPDF">
          {{ t('menu.downloadSchedulePdf') }}
        </button>
      </div>

      <router-link to="/mis-ausencias" class="btn btn-primary w-100 mb-2" @click="cerrarOffcanvas">
        {{ t('modal.sidemenuAbsence') }}
      </router-link>

      <router-link to="/guardias" class="btn btn-primary w-100 mb-2" @click="cerrarOffcanvas">
        {{ t('modal.sidemenuGuards') }}
      </router-link>

    </div>
  </div>
  

  <modalmensaje :visible="modalVisible" :titulo="modalTitulo" :mensaje="modalMensaje" :tipo="modalTipo"
    @cerrar="cerrarModal" />

</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../axios'
import modalmensaje from '../components/ModalMensaje.vue'
import Horario from '../components/Horario.vue'
import { useI18n } from '../composables/useI18n'


// Estado del modal
const modalVisible = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')
const modalTipo = ref('info')

const auth = useAuthStore()
const fileInput = ref(null)
const cargando = ref(false)
const router = useRouter()
const menuAbierto = ref(false)
const { t } = useI18n()


onMounted(() => {
  // Mostrar modal tras recarga si corresponde
  if (localStorage.getItem('mostrarModalImportacion') === '1') {
    mostrarModal(t('modal.importSuccessTitle'), t('modal.importSuccessMessage'), 'success')
    localStorage.removeItem('mostrarModalImportacion')
  }

  // Detectar cuando se abre/cierra el offcanvas
  const sidePanelEl = document.getElementById('sidePanel')
  if (sidePanelEl) {
    sidePanelEl.addEventListener('shown.bs.offcanvas', () => {
      menuAbierto.value = true
    })
    sidePanelEl.addEventListener('hidden.bs.offcanvas', () => {
      menuAbierto.value = false
    })
  }

  // Cerrar offcanvas por si quedó abierto
  setTimeout(() => {
    cerrarOffcanvas()
    router.afterEach(() => {
      cerrarOffcanvas()
    })
  }, 100)
})

function abrirArchivoSelec() {
  fileInput.value.value = ''
  fileInput.value.click()
}

function subirArchivoSelec(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()

  reader.onload = async () => {
    const base64File = reader.result.split(',')[1]
    cargando.value = true

    try {
      const response = await axios.post('/api/horarios/importacion', { file: base64File }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      console.log(' Respuesta del backend:', response.data)

      // Mostrar modal con mensaje genérico
      mostrarModal(t('modal.importSuccessTitle'), response.data , 'success')

      // Refrescar el horario (función expuesta desde el componente Horario.vue)
      Horario.value?.cargarDatos()

    } catch (error) {
      console.error(' Error al importar el archivo:', error)
      mostrarModal(t('modal.importErrorTitle'), t('modal.importErrorMessage'), 'error')
    } finally {
      cargando.value = false
    }
  }

  reader.readAsDataURL(file)
}




//Esta función cierra el offcanvas lateral pero no funciona bien. Creo que el desarrollador metió esta función porque no sabía cómo cerrar el offcanvas al navegar o no lo hacía correctamente. De hecho, se puede ver en el navegador cómo el fondo se queda oscurecido y hay que hacer un par de clicks para continuar. Personalmente, creo que es mejor evitar el offcanvas y usar un menu clñásico controlando la hamburguesa cuando corresponda por tamaño de pantalla.
function cerrarOffcanvas() {
  // Usa la API de Bootstrap para cerrar correctamente el offcanvas
  const canvasEl = document.getElementById('sidePanel')

  if (canvasEl && typeof bootstrap !== 'undefined') {
    let offcanvas = bootstrap.Offcanvas.getInstance(canvasEl)
    if (!offcanvas) {
      offcanvas = new bootstrap.Offcanvas(canvasEl)
    }
    try {
      offcanvas.hide()
    } catch (e) {
      console.warn('No se pudo cerrar el offcanvas:', e)
    }
  }
}

function cerrarMenuAlClic() {
  // Cerrar el offcanvas cuando se hace clic en el overlay
  cerrarOffcanvas()
}

/*
router.afterEach(() => {
  cerrarOffcanvas()
})
*/
/*
onMounted(() => {
  setTimeout(() => {
    cerrarOffcanvas() // por si se quedó al recargar

    router.afterEach(() => {
      cerrarOffcanvas()
    })
  }, 100)

})*/


function mostrarModal(titulo, mensaje, tipo = 'info') {
  modalTitulo.value = titulo
  modalMensaje.value = mensaje
  modalTipo.value = tipo
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
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

    // ➕ Formatear la fecha actual
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
    mostrarModal('Error', mensaje, 'error')
  } finally {
    cargando.value = false
  }
}



</script>

<style scoped>
/* Overlay invisible para cerrar el menú al clic fuera */
.overlay-invisible {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 1040;
  cursor: pointer;
}
</style>