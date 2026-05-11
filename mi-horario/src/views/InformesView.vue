<template>
  <div class="container-fluid mt-5 pt-4">
    <h1 class="mb-5 text-center">{{ t('reports.reportsTitle') }}</h1>

    <!-- Filtro por Profesor con búsqueda -->
    <div v-if="profesores.length > 0" class="row mb-5">
      <div class="col-md-6 mx-auto">
        <div class="card p-4 shadow-sm border-primary">
          <label for="selectProfesor" class="form-label fw-bold mb-3">
            🔍 {{ t('reports.filterByProfessor') }}
          </label>
          
          <!-- Desplegable simple con profesores -->
          <select 
            id="selectProfesor"
            v-model="profesorSeleccionado" 
            class="form-select form-select-lg mb-3"
            @change="cargarEstadisticas"
          >
            <option :value="null">{{ t('reports.showAll') }}</option>
            <option v-for="profesor in profesores" :key="obtenerIdProfesor(profesor)" :value="obtenerIdProfesor(profesor)">
              {{ profesor.nombre }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Gráfico de Eventos por Tipo -->
    <div class="row">
      <div class="col-md-8 mx-auto">
        <div class="card shadow-sm p-4">
          <h5 class="card-title mb-4">📊 {{ t('reports.eventsByType') }}</h5>
          <div style="position: relative; height: 350px;" v-show="hayDatos">
            <canvas id="graficoEventos"></canvas>
          </div>
          <p v-if="!hayDatos" class="text-muted text-center mt-5 mb-5">
            {{ t('reports.noDataAvailable') }}
          </p>
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
import { useI18n } from '../composables/useI18n'
import { tieneRol } from '../utils/roles'

const auth = useAuthStore()
const { t } = useI18n()
const profesores = ref([])
const profesorSeleccionado = ref(null)
let chartEventos = null
const hayDatos = ref(false)

function obtenerIdProfesor(profesor) {
  return profesor?.idProfesor ?? profesor?.id ?? profesor?.profesorId ?? profesor?.id_profesor ?? null
}

onMounted(async () => {
  // Cargar lista de profesores si es administrador
  if (tieneRol(auth.usuario?.rol, 'administrador')) {
    try {
      const response = await api.get('/profesores')
      profesores.value = response.data
      console.log('✅ Profesores cargados:', profesores.value.length)
    } catch (error) {
      console.error('❌ Error cargando profesores:', error)
    }
  }

  cargarEstadisticas()
})

async function cargarEstadisticas() {
  try {
    const params = {}
    if (profesorSeleccionado.value !== null) {
      params.profesorId = Number(profesorSeleccionado.value)
      const profesor = profesores.value.find(p => obtenerIdProfesor(p) === Number(profesorSeleccionado.value))
      console.log('📊 Cargando datos para:', profesor?.nombre, '(ID:', profesorSeleccionado.value + ')')
    } else {
      console.log('📊 Cargando datos para TODOS los profesores')
    }

    const response = await api.get('/tracking/stats', { params })
    const datos = response.data

    console.log('📈 Datos recibidos del servidor:', datos)

    // Actualizar gráfico de eventos
    actualizarGraficoEventos(datos.porTipo || [])
  } catch (error) {
    console.error('❌ Error cargando estadísticas:', error)
    hayDatos.value = false
  }
}

function actualizarGraficoEventos(datos) {
  const ctx = document.getElementById('graficoEventos')
  
  if (chartEventos) {
    chartEventos.destroy()
  }

  if (!datos || datos.length === 0) {
    hayDatos.value = false
    console.log('⚠️ Sin datos para mostrar')
    return
  }

  hayDatos.value = true
  console.log('✅ Mostrando gráfico con', datos.length, 'tipos de eventos')

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
          position: 'bottom',
          labels: {
            font: { size: 13 },
            padding: 20
          }
        }
      }
    }
  })
}

function limpiarFiltro() {
  profesorSeleccionado.value = null
  cargarEstadisticas()
  console.log('🔄 Filtro limpiado - mostrando todos')
}
</script>

<style scoped>
.border-primary {
  border-left: 4px solid #0d6efd !important;
}

.card {
  border-radius: 10px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important;
}

.form-select, .form-control {
  border-radius: 8px;
  border: 2px solid #dee2e6;
  transition: all 0.3s ease;
}

.form-select:focus, .form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

h1 {
  color: #0d6efd;
  font-weight: 600;
}

.form-select-lg {
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  color: white;
}
</style>
