<template>
  <MenuLateral />
  <div class="contenedor-ausencias">
    <div>
      <h2 class="mb-4">Mis Ausencias</h2>

      <!-- Botones de control -->
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <!-- Botón para mostrar/ocultar formulario -->
        <button class="btn btn-outline-primary" @click="mostrarFormulario = !mostrarFormulario">
          {{ mostrarFormulario ? 'Ocultar formulario' : 'Crear Ausencia' }}
        </button>

        <!-- Buscador por fecha -->
        <!-- Nuevo buscador avanzado por día, mes y/o año -->
        <div class="filtro-fecha">
          <label class="form-label mb-0">Filtrar por fecha:</label>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <input type="text" class="form-control" placeholder="Día (dd)" v-model="filtroDia" style="width: 100px;" />
            <input type="text" class="form-control" placeholder="Mes (mm)" v-model="filtroMes" style="width: 100px;" />
            <input type="text" class="form-control" placeholder="Año (aaaa)" v-model="filtroAnio"
              style="width: 120px;" />
            <button class="btn btn-outline-primary" @click="filtrarPorFechaAvanzado">Buscar</button>
            <button class="btn btn-outline-secondary" @click="resetearFiltro">Mostrar todas</button>
          </div>
        </div>

      </div>


    </div>

    <!-- Formulario para crear nueva ausencia -->
    <div v-if="mostrarFormulario" class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Registrar nueva ausencia</h5>
        <form @submit.prevent="crearAusencia">
          <div class="row gy-2 gx-3">
            <div class="col-md-4">
              <label for="fecha" class="form-label">Fecha</label>
              <input type="date" v-model="nuevaAusencia.fecha" class="form-control" required />
            </div>
            <div class="col-md-4">
              <label for="horaInicio" class="form-label">Hora inicio</label>
              <input type="time" v-model="nuevaAusencia.horaInicio" class="form-control" />
            </div>
            <div class="col-md-4">
              <label for="horaFin" class="form-label">Hora fin</label>
              <input type="time" v-model="nuevaAusencia.horaFin" class="form-control" />
            </div>
            <div class="col-12">
              <label for="motivo" class="form-label">Motivo</label>
              <input type="text" v-model="nuevaAusencia.motivo" class="form-control" required />
            </div>
            <div class="col-12 d-flex justify-content-end mt-3">
              <button type="submit" class="btn btn-success">Crear ausencia</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="ausencias.length === 0" class="alert alert-info">
      No tienes ausencias registradas.
    </div>

    <div>
      <TransitionGroup name="fade" tag="div">
        <div v-for="ausenciaDia in ausenciasOrdenadasFiltradas" :key="ausenciaDia.fecha" class="mb-4">
          <div class="card">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <span>{{ formatFecha(ausenciaDia.fecha) }}</span>
              <button class="btn btn-sm btn-danger" @click="eliminarAusencia({ fecha: ausenciaDia.fecha })">
                Eliminar
              </button>
            </div>

            <div class="table-responsive">
              <table class="table table-bordered table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th scope="col">Hora</th>
                    <th scope="col">Asignatura</th>
                    <th scope="col">Aula</th>
                    <th scope="col">Curso</th>
                    <th scope="col">Motivo</th>
                    <th scope="col">Justificada</th>
                    <th scope="col">Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="ausencia in ausenciaDia.lstAusenciaFecha" :key="ausencia.id">
                    <td>
                      {{ ausencia.horario.franja.horaInicio }} - {{ ausencia.horario.franja.horaFin }}
                    </td>
                    <td>{{ ausencia.horario.asignatura.nombre }}</td>
                    <td>{{ ausencia.horario.aula?.codigo || '—' }}</td>
                    <td>{{ ausencia.horario.curso?.nombre || '—' }}</td>
                    <td>{{ ausencia.descripcion }}</td>
                    <td>
                      <span class="badge" :class="ausencia.justificada ? 'bg-success' : 'bg-danger'">
                        {{ ausencia.justificada ? 'Sí' : 'No' }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger" @click="eliminarAusencia({ id: ausencia.id })">
                        🗑️
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
  <ModalMensaje :visible="modalVisible" :titulo="modalTitulo" :mensaje="modalMensaje" :tipo="modalTipo"
    @cerrar="modalVisible = false" />
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import ModalMensaje from '../components/ModalMensaje.vue'
import MenuLateral from '../components/MenuLateral.vue'
import { useAuthStore } from '../stores/auth'


const auth = useAuthStore()


// Ausencias y formulario
const ausencias = ref([])
const nuevaAusencia = ref({
  fecha: '',
  horaInicio: '',
  horaFin: '',
  motivo: ''
})

// Modal mensaje
const modalVisible = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')
const modalTipo = ref('info')

// Mostrar/ocultar formulario
const mostrarFormulario = ref(false)

// Filtro por fecha
const filtroFecha = ref('')
const ausenciasFiltradas = ref([])
const filtroDia = ref('')
const filtroMes = ref('')
const filtroAnio = ref('')


const filtrarPorFechaAvanzado = () => {
  // Normaliza los valores de entrada a 2 dígitos (dd y mm), 4 dígitos para año
  const diaInput = filtroDia.value.padStart(2, '0')
  const mesInput = filtroMes.value.padStart(2, '0')
  const anioInput = filtroAnio.value.padStart(4, '0') // opcional, por consistencia

  ausenciasFiltradas.value = ausencias.value.filter(a => {
    const fecha = new Date(a.fecha)
    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const anio = String(fecha.getFullYear())

    const coincideDia = !filtroDia.value || diaInput === dia
    const coincideMes = !filtroMes.value || mesInput === mes
    const coincideAnio = !filtroAnio.value || anioInput === anio

    return coincideDia && coincideMes && coincideAnio
  })
}



const resetearFiltro = () => {
  filtroDia.value = ''
  filtroMes.value = ''
  filtroAnio.value = ''
  ausenciasFiltradas.value = [...ausencias.value]
}



const mostrarModal = (titulo, mensaje, tipo = 'info') => {
  modalTitulo.value = titulo
  modalMensaje.value = mensaje
  modalTipo.value = tipo
  modalVisible.value = true

  // ⏱️ Autocierre después de 2 segundos (solo si no es error)
  if (tipo !== 'error') {
    setTimeout(() => {
      modalVisible.value = false
    }, 6000)
  }
}


// Crear ausencia
const crearAusencia = async () => {
  try {
    const dto = {
      fecha: nuevaAusencia.value.fecha,
      horaInicio: nuevaAusencia.value.horaInicio || null,
      horaFin: nuevaAusencia.value.horaFin || null,
      motivo: nuevaAusencia.value.motivo
    }

    console.log('Enviando DTO:', dto)

    await axios.post('http://localhost:8081/api/ausencias', dto, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    mostrarModal('Ausencia creada', 'Ausencia creada correctamente.', 'success')
    nuevaAusencia.value = { fecha: '', horaInicio: '', horaFin: '', motivo: '' }
    cargarAusencias()
  } catch (error) {
    console.error('Error al crear ausencia:', error)
    const mensaje = error.response?.data?.message || 'Error al crear la ausencia.'
    mostrarModal('Error', mensaje, 'error')
  }
}

// Eliminar ausencia
const eliminarAusencia = async ({ id = null, fecha = null }) => {
  let mensajeConfirmacion = ''
  console.log(id,fecha)
  if (id) {
    mensajeConfirmacion = '¿Estás seguro de eliminar esta franja de ausencia?'
  } else if (fecha) {
    mensajeConfirmacion = `¿Estás seguro de eliminar las ausencias del día ${formatFecha(fecha)}?`
  } else {
    console.warn(' Se necesita al menos un ID o una fecha para eliminar.')
    return
  }

  if (!confirm(mensajeConfirmacion)) return

  try {
    const payload = {}
    if (id) payload.id = id
    if (fecha) payload.fecha = new Date(fecha).toISOString().split('T')[0]

    await axios.delete('http://localhost:8081/api/ausencias', {
      data: payload,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    await cargarAusencias()

    mostrarModal('Ausencia eliminada', 'Se ha eliminado correctamente.', 'success')
  } catch (error) {
    console.error('Error al eliminar ausencia:', error)
    mostrarModal('Error al eliminar', 'No se pudo eliminar la ausencia.', 'error')
  }
}



// Cargar ausencias
const cargarAusencias = async () => {
  try {
    console .log(auth.usuario.id)
    const idUsuario = auth.usuario.id
    const url = `http://localhost:8081/api/ausencias?idusuario=${idUsuario}`

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    ausencias.value = response.data
    ausenciasFiltradas.value = [...ausencias.value]
  } catch (error) {
    console.error('Error al cargar las ausencias:', error)
    mostrarModal('Error al cargar ausencias', 'No se pudieron obtener las ausencias.', 'error')
  }
}


const ausenciasOrdenadasFiltradas = computed(() =>
  [...ausenciasFiltradas.value].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
)


// Utilidades
const formatFecha = (fechaISO) => {
  const fecha = new Date(fechaISO)
  return fecha.toLocaleDateString()
}


onMounted(() => {
  cargarAusencias()
})
</script>


<style scoped>
.contenedor-ausencias {
  margin-top: 200px;
  padding-left: 50px;
  padding-right: 50px;
}


.filtro-fecha {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filtro-fecha label {
  min-width: 120px;
  white-space: nowrap;
}

.filtro-fecha input[type="date"] {
  min-width: 180px;
}


.filtro-fecha button {
  white-space: nowrap;
}


.scroll-container {
  scroll-behavior: smooth;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}


.card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Animación */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>