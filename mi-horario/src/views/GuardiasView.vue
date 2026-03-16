<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Panel de Registro de Guardias -->
      <div class="col-lg-8">
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">📋 Registrar Guardia</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="registrarGuardia">
              <div class="row gy-3">
                <div class="col-md-6">
                  <label for="fecha" class="form-label">Fecha</label>
                  <input 
                    type="date" 
                    id="fecha"
                    v-model="formularioGuardia.fecha" 
                    class="form-control" 
                    required 
                  />
                </div>

                <div class="col-md-6">
                  <label for="horarioCobertura" class="form-label">Clase a Cubrir</label>
                  <div v-if="cargandoHorarios" class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Cargando...</span>
                  </div>
                  <select 
                    v-else
                    id="horarioCobertura"
                    v-model="formularioGuardia.idHorarioCobertura" 
                    class="form-select" 
                    :disabled="horariosDisponibles.length === 0"
                    required
                  >
                    <option value="">
                      {{ horariosDisponibles.length === 0 
                        ? '-- No hay clases disponibles --' 
                        : '-- Selecciona una clase --' 
                      }}
                    </option>
                    <option 
                      v-for="horario in horariosDisponibles" 
                      :key="horario.id" 
                      :value="horario.id"
                    >
                      {{ horario.curso }} - {{ horario.asignatura }} ({{ horario.franja }}) [{{ horario.dia }}]
                    </option>
                  </select>
                </div>

                <div class="col-12">
                  <div v-if="puntosCalculados > 0" class="alert alert-info" role="alert">
                    <strong>Puntos a ganar:</strong> {{ puntosCalculados }} puntos
                  </div>
                </div>

                <div class="col-12 d-flex justify-content-end gap-2">
                  <button type="reset" class="btn btn-secondary">Limpiar</button>
                  <button type="submit" class="btn btn-success" :disabled="cargando">
                    <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
                    Registrar Guardia
                  </button>
                </div>
              </div>
            </form>

            <!-- Mostrar mensajes de error -->
            <div v-if="mensaje.tipo === 'error'" class="alert alert-danger mt-3" role="alert">
              {{ mensaje.texto }}
            </div>

            <!-- Mostrar mensajes de advertencia -->
            <div v-if="mensaje.tipo === 'warning'" class="alert alert-warning mt-3" role="alert">
              {{ mensaje.texto }}
            </div>

            <!-- Mostrar mensajes de éxito -->
            <div v-if="mensaje.tipo === 'exito'" class="alert alert-success mt-3" role="alert">
              {{ mensaje.texto }}
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Resumen de Puntos -->
      <div class="col-lg-4">
        <div class="card mb-4 bg-light">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">⭐ Resumen de Puntos</h5>
          </div>
          <div class="card-body text-center">
            <h2 class="display-4 text-success">{{ puntosTotales }}</h2>
            <p class="text-muted">Puntos totales acumulados</p>
            <hr />
            <p class="small text-muted">
              <strong>{{ numeroGuardias }}</strong> guardias registradas
            </p>
          </div>
        </div>

        <!-- Leyenda de Puntos -->
        <div class="card">
          <div class="card-header bg-info text-white">
            <h6 class="mb-0">📊 Escala de Puntos</h6>
          </div>
          <div class="card-body">
            <ul class="list-unstyled small">
              <li><span class="badge bg-success">4</span> 1º y 2º ESO</li>
              <li><span class="badge bg-warning">3</span> 3º y 4º ESO / Grado Básico</li>
              <li><span class="badge bg-info">2</span> 1º y 2º BACH / Grados Medios</li>
              <li><span class="badge bg-danger">1</span> Grado Superior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de Guardias Registradas -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-secondary text-white">
            <h5 class="mb-0">📅 Mis Guardias Registradas</h5>
          </div>
          <div class="card-body">
            <div v-if="guardiasRegistradas.length === 0" class="alert alert-info text-center">
              No hay guardias registradas
            </div>

            <div v-else class="table-responsive">
              <table class="table table-striped table-hover">
                <thead class="table-dark">
                  <tr>
                    <th>Fecha</th>
                    <th>Curso</th>
                    <th>Asignatura</th>
                    <th>Aula</th>
                    <th>Franja Horaria</th>
                    <th>Puntos</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="guardia in guardiasRegistradas" :key="guardia.id">
                    <td>{{ formatFecha(guardia.fecha) }}</td>
                    <td><strong>{{ guardia.nombreCursoCobertura }}</strong></td>
                    <td>{{ guardia.asignatura }}</td>
                    <td>{{ guardia.aula || '—' }}</td>
                    <td>{{ guardia.franja }}</td>
                    <td>
                      <span class="badge" :class="getBadgeClass(guardia.puntos)">
                        {{ guardia.puntos }} pts
                      </span>
                    </td>
                    <td>
                      <button 
                        @click="eliminarGuardia(guardia.id)"
                        class="btn btn-sm btn-danger"
                        :disabled="cargando"
                        title="Eliminar guardia"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

const formularioGuardia = ref({
  fecha: '',
  idHorarioCobertura: ''
})

const horariosDisponibles = ref([])
const guardiasRegistradas = ref([])
const puntosTotales = ref(0)
const cargando = ref(false)
const mensaje = ref({ tipo: '', texto: '' })
const cargandoHorarios = ref(false)

const puntosCalculados = computed(() => {
  if (!formularioGuardia.value.idHorarioCobertura) return 0
  const horario = horariosDisponibles.value.find(h => h.id == formularioGuardia.value.idHorarioCobertura)
  return horario ? horario.puntos : 0
})

const numeroGuardias = computed(() => guardiasRegistradas.value.length)

// Cargar horarios disponibles para guardia (con ausencias y que coincidan con el horario del profesor)
async function cargarHorarios() {
  cargandoHorarios.value = true
  mensaje.value = { tipo: '', texto: '' }
  try {
    // Obtener la fecha del formulario, si no hay seleccionada usar hoy
    const fechaParam = formularioGuardia.value.fecha || new Date().toISOString().split('T')[0]
    
    console.log('🔄 Fetching horarios disponibles para guardia en fecha:', fechaParam)
    const response = await axios.get(`http://localhost:8081/api/guardias/horarios-disponibles?fecha=${fechaParam}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📚 Horarios disponibles recibidos del backend:', response.data)

    if (!response.data || response.data.length === 0) {
      console.warn('⚠️ No hay horarios asignados al profesor')
      horariosDisponibles.value = []
      mensaje.value = {
        tipo: 'info',
        texto: 'No hay clases con ausencias disponibles para guardia en esa fecha. Verifica que:\n1. Tengas guardia asignada en tu horario\n2. Exista una ausencia registrada para esa fecha'
      }
      return
    }

    horariosDisponibles.value = response.data
      .filter(h => {
        // Filtrar horarios que tengan curso asignado (evitar nulos)
        if (!h.curso) {
          console.warn('⚠️ Horario sin curso asignado:', h)
          return false
        }
        return true
      })
      .map(h => ({
        id: h.id,
        curso: h.curso || '—',
        asignatura: h.asignatura || '—',
        franja: `${h.horaInicio || '—'} - ${h.horaFin || '—'}`,
        puntos: h.puntos || 0,
        dia: h.dia || '—'
      }))

    console.log('✅ Horarios disponibles procesados:', horariosDisponibles.value)

    if (horariosDisponibles.value.length === 0) {
      mensaje.value = {
        tipo: 'warning',
        texto: 'No hay clases disponibles para cubrir guardia en esa fecha.'
      }
    }
  } catch (error) {
    console.error('❌ Error al cargar horarios disponibles:', error)
    console.error('Status:', error.response?.status)
    console.error('Data:', error.response?.data)
    console.error('Message:', error.message)

    let mensajeError = 'Error al cargar los horarios disponibles para guardia'
    
    if (error.response?.status === 401) {
      mensajeError = 'Sesión expirada. Por favor, inicia sesión de nuevo.'
    } else if (error.response?.status === 403) {
      mensajeError = 'No tienes permisos para acceder a esta información.'
    } else if (error.response?.status === 404) {
      mensajeError = 'Profesor no encontrado.'
    } else if (error.response?.status === 500) {
      mensajeError = 'Error del servidor. Contacta al administrador.'
    }

    mensaje.value = {
      tipo: 'error',
      texto: mensajeError
    }
    horariosDisponibles.value = []
  } finally {
    cargandoHorarios.value = false
  }
}

// Cargar guardias registradas
async function cargarGuardias() {
  try {
    const response = await axios.get('http://localhost:8081/api/guardias/profesor', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    guardiasRegistradas.value = response.data
    puntosTotales.value = guardiasRegistradas.value.reduce((sum, g) => sum + (g.puntos || 0), 0)
  } catch (error) {
    console.error('Error al cargar guardias:', error)
  }
}

// Calcular puntos según el curso
function calcularPuntos(nombreCurso) {
  if (!nombreCurso) return 0
  
  const curso = nombreCurso.toUpperCase()
  
  if ((curso.includes('1º') || curso.includes('1ER')) && curso.includes('ESO')) return 4
  if ((curso.includes('2º') || curso.includes('2DO')) && curso.includes('ESO')) return 4
  if ((curso.includes('3º') || curso.includes('3ER')) && curso.includes('ESO')) return 3
  if ((curso.includes('4º') || curso.includes('4TO')) && curso.includes('ESO')) return 3
  if (curso.includes('GRADO BÁSICO')) return 3
  if ((curso.includes('1º') || curso.includes('1ER')) && (curso.includes('BACH') || curso.includes('BACHILLERATO'))) return 2
  if ((curso.includes('2º') || curso.includes('2DO')) && (curso.includes('BACH') || curso.includes('BACHILLERATO'))) return 2
  if (curso.includes('GRADO MEDIO')) return 2
  if (curso.includes('GRADO SUPERIOR')) return 1
  
  return 0
}

// Registrar guardia
async function registrarGuardia() {
  if (!formularioGuardia.value.fecha || !formularioGuardia.value.idHorarioCobertura) {
    mensaje.value = { tipo: 'error', texto: 'Completa todos los campos requeridos' }
    return
  }

  cargando.value = true
  mensaje.value = { tipo: '', texto: '' }

  try {
    const payload = {
      idHorarioCobertura: formularioGuardia.value.idHorarioCobertura,
      fecha: formularioGuardia.value.fecha
    }

    const response = await axios.post('http://localhost:8081/api/guardias', payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    mensaje.value = { tipo: 'exito', texto: `✅ Guardia registrada correctamente. +${response.data.puntos} puntos` }
    formularioGuardia.value = { fecha: '', idHorarioCobertura: '' }

    // Recargar guardias y puntos
    await cargarGuardias()
    sincronizarPuntos()

    setTimeout(() => {
      mensaje.value = { tipo: '', texto: '' }
    }, 3000)
  } catch (error) {
    const mensajeError = error.response?.data?.message || 'Error al registrar la guardia'
    mensaje.value = { tipo: 'error', texto: mensajeError }
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
}

// Eliminar guardia
async function eliminarGuardia(idGuardia) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta guardia?')) return

  cargando.value = true

  try {
    await axios.delete(`http://localhost:8081/api/guardias/${idGuardia}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    await cargarGuardias()
    sincronizarPuntos()
    mensaje.value = { tipo: 'exito', texto: '✅ Guardia eliminada' }

    setTimeout(() => {
      mensaje.value = { tipo: '', texto: '' }
    }, 2000)
  } catch (error) {
    mensaje.value = { tipo: 'error', texto: 'Error al eliminar la guardia' }
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
}

// Sincronizar puntos totales
async function sincronizarPuntos() {
  try {
    const response = await axios.get('http://localhost:8081/api/guardias/puntos', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    puntosTotales.value = response.data
  } catch (error) {
    console.error('Error al sincronizar puntos:', error)
  }
}

// Formatear fecha
function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES')
}

// Determinar clase de badge según puntos
function getBadgeClass(puntos) {
  if (puntos === 4) return 'bg-success'
  if (puntos === 3) return 'bg-warning text-dark'
  if (puntos === 2) return 'bg-info'
  if (puntos === 1) return 'bg-danger'
  return 'bg-secondary'
}

// Inicializar
onMounted(() => {
  cargarHorarios()
  cargarGuardias()
  sincronizarPuntos()
})

// Watcher para recargar horarios cuando cambie la fecha
watch(() => formularioGuardia.value.fecha, () => {
  if (formularioGuardia.value.fecha) {
    cargarHorarios()
  }
})

</script>

<style scoped>
.card-header {
  font-weight: 600;
}

.display-4 {
  font-weight: 700;
  letter-spacing: 2px;
}

.badge {
  padding: 0.5rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
}

table tbody tr:hover {
  background-color: #f8f9fa;
}

.btn-sm {
  transition: all 0.2s;
}

.btn-sm:hover:not(:disabled) {
  transform: scale(1.1);
}
</style>
