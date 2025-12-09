<template>
  <div
    class="card tarjeta-horizontal d-flex flex-column flex-md-row align-items-center justify-content-between p-3 shadow-sm mb-3"
    @click="emit('verDetalles', profesor.idProfesor)" style="cursor: pointer;">



    <!-- 📦 Agrupamos imagen + info -->
    <div class="contenedor-info d-flex flex-column flex-md-row align-items-start">
      <!-- Imagen -->
      <input type="file" accept="image/*" ref="inputArchivo" @change="subirImagenProfesor" style="display: none;" />

      <img
        :src="imagenProfesor || 'https://img.freepik.com/vector-premium/icono-usuario-avatar-perfil-usuario-icono-persona-imagen-perfil-silueta-neutral-genero-adecuado_697711-1132.jpg'"
        alt="Foto del profesor" class="img-fluid rounded" style="height: 100px; width: 100px; object-fit: cover;" />

      <!-- Info -->
      <div class="flex-grow-1 ms-md-3 mt-0 mt-md-0 text-center text-md-start">

        <div class="info-profesor">
          <h5 class="mb-1 mt-md-4 mt-0">{{ profesor.nombre }}</h5>
          <p class="mb-0 text-muted" v-if="profesor.departamento">{{ profesor.departamento }}</p>
          <p class="mb-0" v-if="profesor.usuario"><strong>Email:</strong> {{ profesor.usuario.email }}</p>
        </div>
      </div>
    </div>

    

  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const imagenProfesor = ref(null)
const inputArchivo = ref(null)

const props = defineProps({
  profesor: Object,
  profesorSeleccionado: Number,
  formulario: Object,
  errores: Object,
  isLoading: Boolean
})

const emit = defineEmits([
  'toggleFormulario',
  'guardarUsuario',
  'cancelarFormulario',
  'eliminarUsuario',
  'modificarUsuario',
  'verDetalles'
])

onMounted(() => {
  cargarImagenProfesor()
})

watch(() => props.profesor?.usuario?.id, () => {
  cargarImagenProfesor()
})

// 👉 Función que carga la imagen actual del profesor
async function cargarImagenProfesor() {
  const id = props.profesor?.usuario?.id
  const tieneImagen = props.profesor?.usuario?.imagen // 💡 Solo cargamos si tiene imagen

  if (!id || !tieneImagen) {
    imagenProfesor.value = null
    return
  }

  try {
    const response = await axios.get(
      `http://localhost:8081/api/usuarios/${id}/imagen`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        },
        responseType: 'arraybuffer',
        validateStatus: status => status === 200
      }
    )

    const tipo = response.headers['content-type'] || 'image/jpeg'
    const base64 = btoa(
      new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
    imagenProfesor.value = `data:${tipo};base64,${base64}`
  } catch {
    imagenProfesor.value = null
  }
}







// 👉 Abre el input al hacer clic sobre la imagen
function abrirInput() {
  inputArchivo.value?.click()
}

// 👉 Sube una nueva imagen y notifica al padre
async function subirImagenProfesor(event) {
  const archivo = event.target.files[0]
  if (!archivo || !props.profesor?.usuario?.id) return

  const formData = new FormData()
  formData.append('imagen', archivo)

  try {
    await axios.post(
      `http://localhost:8081/api/usuarios/${props.profesor.usuario.id}/imagen`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }
    )
    alert(' Imagen actualizada')
    cargarImagenProfesor()
    emit('imagenSubida') //  Dispara recarga en el padre

  } catch (error) {
    console.error(' Error al subir imagen del profesor:', error)
    alert('Error al subir imagen')
  }
}

// 👉 Manejador para abrir/cerrar el formulario
function handleToggleFormulario(profesorId, action) {
  emit('toggleFormulario', { profesorId, action })
}
</script>


<style scoped>
.tarjeta-horizontal {
  width: 750px;
  max-width: 900px;
  min-height: 120px;
  border-radius: 12px;
  transition: all 0.2s ease-in-out;
}

.tarjeta-horizontal:hover {
  transform: scale(1.01);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
}

.botones-profesor {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}


/* === SOLO para móviles === */
@media (max-width: 767.98px) {
  .tarjeta-horizontal {
    padding-left: 200px !important;
    padding-right: 200px !important;
  }

  .contenedor-info {
    flex-direction: row !important;
    align-items: center !important;
    /* Centra imagen y texto verticalmente */
    justify-content: flex-start !important;
    gap: 0.75rem;
    width: 100%;
    /* 👈 asegura alineación completa del contenido */
    margin: 0 !important;
  }

  .contenedor-info img {
    width: 45px !important;
    height: 45px !important;
    flex-shrink: 0;

  }

  .info-profesor {
    text-align: left;
  }

  .info-profesor h5 {
    font-size: 0.85rem;
    margin-top: 0%;
  }

  .info-profesor p {
    font-size: 0.75rem;
    margin: 0;
    color: #18641c;
  }

  /* Botones horizontal en móvil */
  .botones-profesor {
    flex-direction: row !important;
  }

  .botones-profesor .btn {
    font-size: 0.7rem !important;
    padding: 0.25rem 0.4rem !important;
  }

  /* Corrige ancho de botones */
  .botones-profesor .btn.w-100 {
    width: auto !important;
  }
}
</style>
