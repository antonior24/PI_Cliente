<template>
  <div class="container-fluid mt-5 pt-4">
    <h1 class="mb-4 text-center">📊 Informes y Estadísticas</h1>

    <!-- Filtro por Profesor (solo para administrador) -->
    <div v-if="auth.usuario?.rol?.toLowerCase() === 'administrador'" class="row mb-4">
      <div class="col-md-6 mx-auto">
        <div class="card p-3">
          <label for="selectProfesor" class="form-label">Filtrar por profesor:</label>
          <select 
            id="selectProfesor"
            v-model="profesorSeleccionado" 
            class="form-select"
            @change="cargarEstadisticas"
          >
            <option value="">-- Mostrar todos --</option>
            <option v-for="profesor in profesores" :key="profesor.id" :value="profesor.id">
              {{ profesor.nombre }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Información del profesor seleccionado -->
    <div v-if="profesorSeleccionado" class="alert alert-info mb-4">
      <strong>Profesor seleccionado:</strong> {{ profesorNombreSeleccionado }}
    </div>

    <!-- Tarjetas de resumen -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm p-3 bg-primary text-white">
          <h5>Total Eventos</h5>
          <p class="fs-3 mb-0">{{ estadisticas.totalEventos }}</p>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm p-3 bg-success text-white">
          <h5>Horarios Consultados</h5>
          <p class="fs-3 mb-0">{{ estadisticas.horariosConsultados }}</p>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm p-3 bg-warning text-dark">
          <h5>Ausencias Registradas</h5>
          <p class="fs-3 mb-0">{{ estadisticas.ausenciasRegistradas }}</p>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card shadow-sm p-3 bg-info text-white">
          <h5>Acciones Realizadas</h5>
          <p class="fs-3 mb-0">{{ estadisticas.accionesRealizadas }}</p>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm p-4">
          <h5 class="card-title">Eventos por Tipo</h5>
          <div style="position: relative; height: 300px;">
            <canvas id="graficoEventos"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm p-4">
          <h5 class="card-title">Actividad por Día</h5>
          <div style="position: relative; height: 300px;">
            <canvas id="graficoActividad"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de detalles -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card shadow-sm p-4">
          <h5 class="card-title">Últimos Eventos</h5>
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-dark">
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Fecha y Hora</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="evento in ultimosEventos" :key="evento.id">
                  <td>
                    <span class="badge" :class="`bg-${obtenerColorEvento(evento.tipo)}`">
                      {{ evento.tipo }}
                    </span>
                  </td>
                  <td>{{ evento.descripcion }}</td>
                  <td>{{ formatearFecha(evento.fecha) }}</td>
                  <td>{{ evento.detalles || '-' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-if="ultimosEventos.length === 0" class="text-muted text-center mt-3">
              No hay eventos registrados
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import api from '../axios'
import Chart from 'chart.js/auto'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const profesores = ref([])
const profesorSeleccionado = ref('')
const estadisticas = ref({
  totalEventos: 0,
  horariosConsultados: 0,
  ausenciasRegistradas: 0,
  accionesRealizadas: 0
})
const ultimosEventos = ref([])
let chartEventos = null
let chartActividad = null

const profesorNombreSeleccionado = computed(() => {
  if (!profesorSeleccionado.value) return 'Todos'
  const profesor = profesores.value.find(p => p.id === profesorSeleccionado.value)
  return profesor?.nombre || 'Desconocido'
})

onMounted(async () => {
  // Si es administrador, cargar lista de profesores
  if (auth.usuario?.rol?.toLowerCase() === 'administrador') {
    try {
      const response = await api.get('/profesores')
      profesores.value = response.data
    } catch (error) {
      console.error('Error cargando profesores:', error)
    }
  }

  cargarEstadisticas()
})

watch(profesorSeleccionado, () => {
  cargarEstadisticas()
})

async function cargarEstadisticas() {
  try {
    const params = {}
    if (profesorSeleccionado.value) {
      params.profesorId = profesorSeleccionado.value
    }

    const response = await api.get('/tracking/stats', { params })
    const datos = response.data

    // Actualizar estadísticas resumen
    estadisticas.value = {
      totalEventos: datos.totalEventos || 0,
      horariosConsultados: (datos.porTipo?.find(t => t.tipo === 'horario_consultado')?.total || 0),
      ausenciasRegistradas: (datos.porTipo?.find(t => t.tipo === 'ausencia_registrada')?.total || 0),
      accionesRealizadas: (datos.porTipo?.find(t => t.tipo === 'accion_realizada')?.total || 0)
    }

    ultimosEventos.value = datos.ultimosEventos || []

    // Actualizar gráfico de eventos
    actualizarGraficoEventos(datos.porTipo || [])

    // Actualizar gráfico de actividad
    actualizarGraficoActividad(datos.porDia || [])
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
  }
}

function actualizarGraficoEventos(datos) {
  const ctx = document.getElementById('graficoEventos')
  
  if (chartEventos) {
    chartEventos.destroy()
  }

  if (datos.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-muted text-center">Sin datos disponibles</p>'
    return
  }

  chartEventos = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: datos.map(d => d.tipo),
      datasets: [{
        data: datos.map(d => d.total),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

function actualizarGraficoActividad(datos) {
  const ctx = document.getElementById('graficoActividad')
  
  if (chartActividad) {
    chartActividad.destroy()
  }

  if (datos.length === 0) {
    ctx.parentElement.innerHTML = '<p class="text-muted text-center">Sin datos disponibles</p>'
    return
  }

  chartActividad = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: datos.map(d => d.dia),
      datasets: [{
        label: 'Eventos',
        data: datos.map(d => d.total),
        backgroundColor: '#36A2EB',
        borderColor: '#0056b3',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

function obtenerColorEvento(tipo) {
  const colores = {
    'horario_consultado': 'success',
    'ausencia_registrada': 'warning',
    'accion_realizada': 'primary',
    'default': 'secondary'
  }
  return colores[tipo] || colores['default']
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.bg-primary { background-color: #0d6efd !important; }
.bg-success { background-color: #198754 !important; }
.bg-warning { background-color: #ffc107 !important; }
.bg-info { background-color: #0dcaf0 !important; }

.card {
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.table-hover tbody tr:hover {
  background-color: #f5f5f5;
}

.badge {
  padding: 0.5rem 0.75rem;
}
</style>