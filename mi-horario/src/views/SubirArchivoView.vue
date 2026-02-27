<template>
  <MenuLateral />

  <div class="container mt-5 pt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <!-- Título -->
        <h1 class="mb-4 text-center">📤 Subir Archivo de Datos</h1>

        <!-- Zona de drag and drop -->
        <div
          class="drop-zone"
          :class="{ 'drag-over': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
        >
          <div class="drop-zone-content">
            <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <h3 class="mt-3">Arrastra tu archivo aquí</h3>
            <p class="text-muted">o haz clic para seleccionar</p>
          </div>
          <input
            ref="fileInput"
            type="file"
            class="file-input"
            @change="handleFileSelect"
            accept=".xlsx,.xls,.csv"
          />
        </div>

        <!-- Información de archivos soportados -->
        <div class="mt-4 alert alert-info">
          <strong>📋 Formatos soportados:</strong> .xlsx, .xls, .csv
        </div>

        <!-- Previsualización del archivo seleccionado -->
        <div v-if="selectedFile" class="card mt-4">
          <div class="card-body">
            <h5 class="card-title">Archivo seleccionado</h5>
            <div class="file-info">
              <p><strong>Nombre:</strong> {{ selectedFile.name }}</p>
              <p><strong>Tamaño:</strong> {{ formatFileSize(selectedFile.size) }}</p>
            </div>

            <!-- Barra de progreso -->
            <div v-if="isUploading" class="progress mt-3">
              <div
                class="progress-bar progress-bar-striped progress-bar-animated"
                :style="{ width: uploadProgress + '%' }"
              >
                {{ uploadProgress }}%
              </div>
            </div>

            <!-- Botones de acción -->
            <div v-if="!isUploading" class="mt-4 d-flex gap-2">
              <button class="btn btn-primary" @click="uploadFile">
                ✓ Subir archivo
              </button>
              <button class="btn btn-secondary" @click="clearFile">
                ✕ Cancelar
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje de resultado -->
        <ModalMensaje
          :visible="modalVisible"
          :titulo="modalTitulo"
          :mensaje="modalMensaje"
          :tipo="modalTipo"
          @cerrar="cerrarModal"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MenuLateral from '../components/MenuLateral.vue'
import ModalMensaje from '../components/ModalMensaje.vue'

const router = useRouter()
const auth = useAuthStore()

const fileInput = ref(null)
const isDragOver = ref(false)
const selectedFile = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)

// Modal
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

function handleDrop(event) {
  isDragOver.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

function handleFileSelect(event) {
  const files = event.target.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

async function uploadFile() {
  if (!selectedFile.value) {
    mostrarModal('Error', 'Por favor selecciona un archivo', 'error')
    return
  }

  isUploading.value = true
  uploadProgress.value = 0

  try {
    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const base64File = reader.result.split(',')[1]

        const response = await axios.post(
          'http://localhost:8081/api/horarios/importacion',
          { file: base64File },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            onUploadProgress: (progressEvent) => {
              uploadProgress.value = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              )
            }
          }
        )

        mostrarModal('✓ Importación exitosa', response.data, 'success')
        clearFile()

        // Redirigir a home después de 2 segundos
        setTimeout(() => {
          router.push('/home')
        }, 2000)
      } catch (error) {
        console.error('Error al importar el archivo:', error)
        const mensajeError = error.response?.data || 'No se pudo importar el archivo'
        mostrarModal('Error', mensajeError, 'error')
      } finally {
        isUploading.value = false
        uploadProgress.value = 0
      }
    }

    reader.readAsDataURL(selectedFile.value)
  } catch (error) {
    console.error('Error al procesar el archivo:', error)
    mostrarModal('Error', 'Error al procesar el archivo', 'error')
    isUploading.value = false
  }
}
</script>

<style scoped>
.drop-zone {
  border: 3px dashed #007bff;
  border-radius: 15px;
  padding: 60px 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.drop-zone:hover {
  border-color: #0056b3;
  background-color: #e7f1ff;
}

.drop-zone.drag-over {
  border-color: #0056b3;
  background-color: #cce5ff;
  transform: scale(1.02);
}

.drop-zone-content {
  pointer-events: none;
}

.drop-icon {
  width: 60px;
  height: 60px;
  color: #007bff;
  margin: 0 auto;
}

.drop-zone h3 {
  color: #333;
  font-weight: 600;
}

.drop-zone p {
  margin-bottom: 0;
  font-size: 0.95rem;
}

.file-input {
  display: none;
}

.file-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.file-info p {
  margin: 8px 0;
  font-size: 0.95rem;
}

.gap-2 {
  gap: 0.5rem;
}

.progress {
  height: 25px;
  border-radius: 8px;
}

.progress-bar {
  font-weight: 600;
  font-size: 0.85rem;
}
</style>
