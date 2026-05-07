<template>
  <ModalCambioContraseña :visible="mostrarModal" @cerrar="mostrarModal = false" />
  <div class="mx-4 home-content">
    <!-- Mostrar horario del usuario logueado si es profesor -->
    <div v-if="esProfesor" class="container-fluid home-profesor-layout">
      <div class="bloque-horario">
        <h2 class="mb-4 titulo-mi-horario">{{ t('views.homeMySchedule') }}</h2>
        <Horario :mis-horarios="true" />
      </div>

      <!-- Sección de Guardias para HOY -->
      <div class="row mt-5 bloque-ausencias-hoy">
        <!-- Ausencias disponibles para cubrir HOY - con estado de cobertura -->
        <div class="col-12">
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">📅 Ausencias disponibles para cubrir HOY</h5>
            </div>
            <div class="card-body">
              <div v-if="cargandoGuardias" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                  <span class="visually-hidden">{{ t('views.loading') }}</span>
                </div>
              </div>
              <div v-else-if="ausenciasConEstado.length === 0" class="alert alert-info text-center mb-0">
                ✅ No hay ausencias para cubrir hoy
              </div>
              <div v-else class="table-responsive">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>{{ t('views.course') }}</th>
                      <th>{{ t('views.subject') }}</th>
                      <th>{{ t('views.guardHour') }}</th>
                      <th>{{ t('views.points') }}</th>
                      <th>Estado de Cobertura</th>
                      <th>{{ t('views.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ausencia in ausenciasConEstado" :key="ausencia.id">
                      <td><strong>{{ ausencia.curso }}</strong></td>
                      <td>{{ ausencia.asignatura }}</td>
                      <td>{{ ausencia.franja }}</td>
                      <td>
                        <span :class="`badge ${getBadgeClass(ausencia.puntos)}`">
                          {{ ausencia.puntos }}
                        </span>
                      </td>
                      <td>
                        <div v-if="ausencia.cubierta" class="d-flex align-items-center gap-2">
                          <span class="badge bg-success">✅ Cubierta</span>
                          <small class="text-muted">{{ ausencia.profesorCobertura }}</small>
                        </div>
                        <div v-else class="text-danger">
                          <small>Sin cubrir</small>
                        </div>
                      </td>
                      <td>
                        <button 
                          v-if="!ausencia.cubierta"
                          @click="irARegistrarGuardia(ausencia)" 
                          class="btn btn-sm btn-primary"
                          title="Registrar guardia"
                        >
                          ➕
                        </button>
                        <span v-else class="text-success">✓</span>
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

    <!-- Mostrar mensaje para administradores -->
    <div v-else class="text-center">
      <p>{{ t('views.homeWelcome') }}</p>
    </div>
  </div>

</template>




<script setup>
import { ref, computed, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Horario from '../components/Horario.vue'
import ModalCambioContraseña from '../components/ModalCambioContraseña.vue'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../composables/useI18n'

const auth = useAuthStore()
const router = useRouter()
const mostrarModal = ref(false)
const { t } = useI18n()

// Variables para guardias
const horariosDisponiblesHoy = ref([])
const guardiasRegistradasHoy = ref([])
const ausenciasConEstado = ref([])
const cargandoGuardias = ref(false)

const esProfesor = computed(() => {
  const rol = auth.usuario?.rol
  return Boolean(rol && String(rol).toLowerCase() === 'profesor')
})

// Obtener fecha de hoy en formato YYYY-MM-DD
function getFechaHoy() {
  return new Date().toISOString().split('T')[0]
}

// Cargar ausencias disponibles para guardia HOY
async function cargarAusenciasHoy() {
  try {
    const fechaHoy = getFechaHoy()
    const response = await axios.get(`/api/guardias/horarios-disponibles?fecha=${fechaHoy}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    horariosDisponiblesHoy.value = (response.data || [])
      .map(h => ({
        id: h.id,
        curso: h.curso || '—',
        asignatura: h.asignatura || '—',
        franja: `${h.horaInicio || '—'} - ${h.horaFin || '—'}`,
        puntos: h.puntos || 0,
        dia: h.dia || '—'
      }))
    
    // Combinar con guardias registradas
    combinarAusenciasConGuardias()
  } catch (error) {
    console.error('Error al cargar ausencias de hoy:', error)
    horariosDisponiblesHoy.value = []
  }
}

// Cargar todas las guardias registradas HOY (para ver quién las cubrió)
async function cargarGuardiasDelDiaHoy() {
  try {
    const fechaHoy = getFechaHoy()
    const response = await axios.get(`/api/guardias/fecha?fecha=${fechaHoy}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    guardiasRegistradasHoy.value = response.data || []
    
    // Combinar con ausencias disponibles
    combinarAusenciasConGuardias()
  } catch (error) {
    console.error('Error al cargar guardias del día:', error)
    guardiasRegistradasHoy.value = []
  }
}

// Combinar ausencias con guardias para mostrar estado de cobertura
function combinarAusenciasConGuardias() {
  ausenciasConEstado.value = horariosDisponiblesHoy.value.map(ausencia => {
    // Buscar si hay guardia registrada para este horario
    const guardiaRegistrada = guardiasRegistradasHoy.value.find(g => 
      g.idHorarioCobertura === ausencia.id
    )
    
    return {
      ...ausencia,
      cubierta: !!guardiaRegistrada,
      profesorCobertura: guardiaRegistrada ? guardiaRegistrada.nombreProfesor : null
    }
  })
}

// Cargar guardias registradas del profesor (solo las suyas)
async function cargarGuardiasDelProfesor() {
  try {
    const response = await axios.get('/api/guardias/profesor', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.data && Array.isArray(response.data)) {
      const fechaHoy = getFechaHoy()
      // Esto ya no se usa pero lo mantenemos por si acaso
      guardiasRegistradasHoy.value = response.data.filter(g => {
        const fechaGuardia = g.fecha.substring(0, 10)
        return fechaGuardia === fechaHoy
      })
    }
  } catch (error) {
    console.error('Error al cargar guardias del profesor:', error)
  }
}

// Determinar clase de badge según puntos
function getBadgeClass(puntos) {
  if (puntos === 4) return 'bg-success'
  if (puntos === 3) return 'bg-warning text-dark'
  if (puntos === 2) return 'bg-info'
  if (puntos === 1) return 'bg-danger'
  return 'bg-secondary'
}

// Navegar a la página de guardias
function irARegistrarGuardia(horario) {
  router.push('/guardias')
}

// Cargar datos al montar el componente
onMounted(async () => {
  if (auth.usuario?.cambiarContraseña) {
    mostrarModal.value = true
  }

  // Si es profesor, cargar guardias
  if (esProfesor.value) {
    cargandoGuardias.value = true
    // Cargar ambas en paralelo
    await Promise.all([cargarAusenciasHoy(), cargarGuardiasDelDiaHoy()])
    cargandoGuardias.value = false
  }
})

// Recargar guardias cuando vuelves a HomeView desde otra página (después de registrar)
onActivated(async () => {
  if (esProfesor.value) {
    await Promise.all([cargarAusenciasHoy(), cargarGuardiasDelDiaHoy()])
  }
})

</script>

<style scoped>
.home-content {
  margin-top: 150px;
}

@media (max-width: 768px) {
  .home-content {
    margin-top: 50px;
  }

  .home-profesor-layout {
    display: flex;
    flex-direction: column;
  }

  .bloque-ausencias-hoy {
    order: 1;
    margin-top: 0.75rem !important;
  }

  .bloque-horario {
    order: 2;
  }

  .titulo-mi-horario {
    display: none;
  }
}
</style>

<style scoped>
.card-header {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.badge {
  font-weight: 600;
  padding: 0.4rem 0.6rem;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

.list-group-item {
  border-left: 3px solid #0d6efd;
  padding: 0.75rem 1rem;
}

.btn-sm {
  transition: all 0.2s ease;
  padding: 0.4rem 0.6rem;
}

.btn-sm:hover:not(:disabled) {
  transform: scale(1.15);
}
</style>
