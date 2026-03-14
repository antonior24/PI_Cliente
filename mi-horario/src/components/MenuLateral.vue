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
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-3">Subiendo archivo...</p>
    </div>
  </div>

  <!-- Overlay invisible para cerrar al clic fuera -->
  <div v-if="menuAbierto" class="overlay-invisible" @click="cerrarMenuAlClic"></div>

  <!-- Offcanvas lateral -->
  <div class="offcanvas offcanvas-start" tabindex="-1" id="sidePanel" aria-labelledby="sidePanelLabel"
    data-bs-backdrop="false" data-bs-keyboard="false">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="sidePanelLabel">Menú lateral</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
    </div>

    <div class="offcanvas-body">
      <input ref="fileInput" type="file" @change="subirArchivoSelec" style="display: none" />

      <router-link to="/home" class="btn btn-primary w-100 mb-2" @click="cerrarOffcanvas">Inicio</router-link>

      <div v-if="auth.usuario?.rol === 'administrador'">
        <router-link to="/subir-archivo" class="btn btn-primary w-100 mb-2" @click="cerrarOffcanvas">Subir archivo de datos</router-link>
        <router-link to="/datos-profesorado" class="btn btn-primary w-100 mb-2" @click="cerrarOffcanvas">Datos
          profesorado</router-link>
        <button class="btn btn-primary w-100 mb-2" @click="generarParteDiario">
          Generar partes diario
        </button>

      </div>



      <router-link to="/mis-ausencias" class="btn btn-primary w-100 mb-2" @click="cerrarOffcanvas">
        Ausencia
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
import modalmensaje from '../components/ModalMensaje.vue'
import Horario from '../components/Horario.vue'


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


onMounted(() => {
  // Mostrar modal tras recarga si corresponde
  if (localStorage.getItem('mostrarModalImportacion') === '1') {
    mostrarModal('Importación exitosa', 'Archivo importado correctamente.', 'success')
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
      const response = await axios.post('http://localhost:8081/api/horarios/importacion', { file: base64File }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      console.log(' Respuesta del backend:', response.data)

      // Mostrar modal con mensaje genérico
      mostrarModal(' Importación exitosa', response.data , 'success')

      // Refrescar el horario (función expuesta desde el componente Horario.vue)
      Horario.value?.cargarDatos()

    } catch (error) {
      console.error(' Error al importar el archivo:', error)
      mostrarModal(' Error', 'No se pudo importar el archivo.', 'error')
    } finally {
      cargando.value = false
    }
  }

  reader.readAsDataURL(file)
}




//Esta funcion cierra el offcanvas lateral pero no funciona bien. Creo que el desarrollador metio esta funcion porque no sabia como cerrar el offcanvas al navegar o no lo hacia correctamente. De hecho, se puede ver en el navegador como el fondo se queda oscurecido y hay que hacer un par de clicks para continuar. Personalmente, creo que es mejor evitar el offcanvas y usar un menu clasico controlando la hamburguesa cuando corresponda por tamaño de pantalla.
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
    const response = await axios.get('http://localhost:8081/api/parte-ausencias', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

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
    mostrarModal('Error', 'No se pudo generar el parte diario.', 'error')
  } finally {
    cargando.value = false
  }
}



</script>

<style scoped>
/* Puedes anade estilos si deseas */
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