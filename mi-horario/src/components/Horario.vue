<template>
  <div class="container-fluid pt-4">
    <div v-if="errorCarga" class="alert alert-danger py-2" role="alert">
      {{ errorCarga }}
    </div>
    <div v-else-if="!cargando && horario.length === 0" class="alert alert-info py-2" role="alert">
      No hay horario disponible para este profesor.
    </div>

    <!-- Vista escritorio -->
    <div class="d-none d-md-block">
      <table class="table table-bordered text-start align-middle w-100 small">
        <thead class="table-dark text-center">
          <tr>
            <th style="width: 100px;">{{ t('schedule.period') }}</th>
            <th v-for="dia in diasSemana" :key="dia" style="width: 130px;">{{ traducirDia(dia) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="franja in franjasOrdenadas" :key="franja.horaInicio">
            <td class="bg-light fw-bold text-center">
              {{ franja.horaInicio.slice(0, 5) }} - {{ franja.horaFin.slice(0, 5) }}
            </td>
            <td v-for="dia in diasSemana" :key="dia" style="padding: 4px; font-size: 13px; text-align: left"
              :style="esRecreo(franja)
                  ? estiloRecreo
                  : getClases(dia, franja)[0]
                    ? obtenerEstilosAsignatura(getClases(dia, franja)[0].asignatura?.nombre)
                    : {}">
              <div v-if="esRecreo(franja)">
                <strong>{{ t('schedule.break') }}</strong>
              </div>
              <div v-else>
                <div v-for="(clase, i) in getClases(dia, franja)" :key="i" class="mb-1">
                  {{ t('schedule.classroom') }}: {{ clase.aula?.codigo || '-' }}<br />
                  {{ t('schedule.course') }}: {{ clase.curso?.nombre || '-' }}<br />
                  {{ t('schedule.subject') }}: {{ clase.asignatura?.nombre || '-' }}
                  <hr v-if="getClases(dia, franja).length > 1 && i < getClases(dia, franja).length - 1" />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vista móvil: un solo día visible, deslizable -->
    <div class="d-md-none">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <button class="btn btn-sm btn-outline-secondary" @click="diaAnterior" :disabled="diaActualIndex === 0">←</button>
        <strong>{{ traducirDia(diaActual) }}</strong>
        <button class="btn btn-sm btn-outline-secondary" @click="diaSiguiente" :disabled="diaActualIndex === diasSemana.length - 1">→</button>
      </div>
      <table class="table table-bordered text-start align-middle w-100 small">
        <thead class="table-dark text-center">
          <tr>
            <th style="width: 100px;">{{ t('schedule.period') }}</th>
            <th style="width: 100%">{{ t('schedule.schedule') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="franja in franjasOrdenadas" :key="franja.horaInicio">
            <td class="bg-light fw-bold text-center">
              {{ franja.horaInicio.slice(0, 5) }} - {{ franja.horaFin.slice(0, 5) }}
            </td>
            <td style="font-size: 13px; padding: 6px;"
              :style="esRecreo(franja)
                ? estiloRecreo
                : getClases(diaActual, franja)[0]
                  ? obtenerEstilosAsignatura(getClases(diaActual, franja)[0].asignatura?.nombre)
                  : {}">
              <div v-if="esRecreo(franja)">
                <strong>{{ t('schedule.break') }}</strong>
              </div>
              <div v-else>
                <div v-for="(clase, i) in getClases(diaActual, franja)" :key="i" class="mb-1">
                  {{ t('schedule.classroom') }}: {{ clase.aula?.codigo || '-' }}<br />
                  {{ t('schedule.course') }}: {{ clase.curso?.nombre || '-' }}<br />
                  {{ t('schedule.subject') }}: {{ clase.asignatura?.nombre || '-' }}
                  <hr v-if="getClases(diaActual, franja).length > 1 && i < getClases(diaActual, franja).length - 1" />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useI18n } from '../composables/useI18n'

// Props: accept either idProfesor or profesorId (kebab-case from parent), and an explicit fetchAll
const props = defineProps({
  idProfesor: { type: [Number, String], default: null },
  profesorId: { type: [Number, String], default: null },
  fetchAll: { type: Boolean, default: false },
  misHorarios: { type: Boolean, default: false }
})
const { t } = useI18n()

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const diaActualIndex = ref(0)
const diaActual = computed(() => diasSemana[diaActualIndex.value])
const horario = ref([])
const cargando = ref(false)
const errorCarga = ref('')
const route = useRoute()
const effectiveIdProfesor = computed(() => {
  const idFromRoute = route.params.id ?? null
  const rawId = props.idProfesor ?? props.profesorId ?? idFromRoute ?? null
  const parsed = Number(rawId)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
})

const franjasFijas = [
  { idFranja: 'R1', horaInicio: '18:00:00', horaFin: '18:15:00' },
  { idFranja: 'R2', horaInicio: '11:15:00', horaFin: '11:45:00' }
]

const franjasOrdenadas = computed(() => {
  const mapa = new Map()
  for (const h of horario.value) {
    const clave = h?.franja?.horaInicio
    if (!clave) continue
    if (!mapa.has(clave)) mapa.set(clave, h.franja)
  }

  const recreoSiempre = franjasFijas.find(f => f.horaInicio === '11:15:00')
  if (recreoSiempre && !mapa.has(recreoSiempre.horaInicio)) {
    mapa.set(recreoSiempre.horaInicio, recreoSiempre)
  }

  const tieneClasesDespuesDe18 = horario.value.some(h => (h?.franja?.horaInicio || '') > '18:00:00')
  const recreoTarde = franjasFijas.find(f => f.horaInicio === '18:00:00')
  if (tieneClasesDespuesDe18 && recreoTarde && !mapa.has(recreoTarde.horaInicio)) {
    mapa.set(recreoTarde.horaInicio, recreoTarde)
  }

  return Array.from(mapa.values()).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
})

function getClases(dia, franja) {
  return horario.value.filter(
    h => h.dia === dia && h?.franja?.horaInicio?.slice(0, 5) === franja.horaInicio.slice(0, 5)
  )
}

function traducirDia(dia) {
  const mapa = {
    Lunes: t('days.monday'),
    Martes: t('days.tuesday'),
    Miércoles: t('days.wednesday'),
    Jueves: t('days.thursday'),
    Viernes: t('days.friday')
  }
  return mapa[dia] || dia
}

function esRecreo(franja) {
  return franjasFijas.some(f => f.horaInicio === franja.horaInicio)
}

const estiloRecreo = {
  backgroundColor: 'rgba(255, 183, 77, 0.6)',
  border: '2px dashed orange',
  textAlign: 'center'
}

function diaAnterior() {
  if (diaActualIndex.value > 0) diaActualIndex.value--
}

function diaSiguiente() {
  if (diaActualIndex.value < diasSemana.length - 1) diaActualIndex.value++
}

function normalizarDia(valorDia) {
  const crudo = String(valorDia || '').trim()
  const normalizado = crudo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  const mapa = {
    L: 'Lunes',
    LUNES: 'Lunes',
    M: 'Martes',
    MARTES: 'Martes',
    X: 'Miércoles',
    MIERCOLES: 'Miércoles',
    J: 'Jueves',
    JUEVES: 'Jueves',
    V: 'Viernes',
    VIERNES: 'Viernes'
  }

  return mapa[normalizado] || crudo || '-'
}

function normalizarItemHorario(item) {
  const horaInicio = item?.franja?.horaInicio || item?.horaInicio || null
  const horaFin = item?.franja?.horaFin || item?.horaFin || null

  return {
    id: item?.id,
    dia: normalizarDia(item?.dia),
    franja: {
      horaInicio,
      horaFin
    },
    aula: item?.aula?.codigo ? item.aula : { codigo: item?.aula || '-' },
    curso: item?.curso?.nombre ? item.curso : { nombre: item?.curso || '-' },
    asignatura: item?.asignatura?.nombre ? item.asignatura : { nombre: item?.asignatura || '-' },
    puntos: item?.puntos != null ? item.puntos : null
  }
}

async function cargarHorario() {
  cargando.value = true
  errorCarga.value = ''

  try {
    // Do not fetch the entire dataset by default. Fetch only when a professor id is provided
    // or when explicitly requested via fetchAll prop.
    if (!effectiveIdProfesor.value && !props.fetchAll && !props.misHorarios) {
      horario.value = []
      cargando.value = false
      return
    }

    let url = 'http://localhost:8081/api/horarios'
    if (effectiveIdProfesor.value) {
      url = `http://localhost:8081/api/horarios?idProfesor=${encodeURIComponent(effectiveIdProfesor.value)}`
    } else if (props.misHorarios) {
      url = 'http://localhost:8081/api/horarios/mis-horarios'
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    const rawData = Array.isArray(response.data) ? response.data : []

    horario.value = rawData
      .map(normalizarItemHorario)
      .filter(item => item?.franja?.horaInicio && item?.franja?.horaFin)
  } catch (error) {
    console.error('Error al cargar el horario:', error)
    horario.value = []
    const status = error?.response?.status
    errorCarga.value = status
      ? `No se pudo cargar el horario (HTTP ${status}).`
      : 'No se pudo cargar el horario.'
  } finally {
    cargando.value = false
  }
}

watch(
  () => [props.idProfesor, props.profesorId, props.fetchAll, props.misHorarios, route.params.id],
  () => {
    cargarHorario()
  },
  { immediate: true }
)

const coloresAsignaturas = ref({})
const paletaColoresSuaves = [
  'rgba(200, 230, 201, 0.8)', 'rgba(187, 222, 251, 0.8)', 'rgba(248, 187, 208, 0.8)',
  'rgba(209, 196, 233, 0.8)', 'rgba(178, 235, 242, 0.8)', 'rgba(255, 224, 178, 0.8)',
  'rgba(220, 237, 200, 0.8)', 'rgba(240, 244, 195, 0.8)', 'rgba(225, 190, 231, 0.8)',
  'rgba(255, 204, 188, 0.8)', 'rgba(197, 202, 233, 0.8)', 'rgba(179, 229, 252, 0.8)',
  'rgba(215, 204, 200, 0.8)', 'rgba(245, 245, 220, 0.8)'
]

function obtenerEstilosAsignatura(asignatura) {
  if (!asignatura) return {}
  if (!coloresAsignaturas.value[asignatura]) {
    const total = Object.keys(coloresAsignaturas.value).length
    const baseColor = paletaColoresSuaves[total % paletaColoresSuaves.length]
    coloresAsignaturas.value[asignatura] = baseColor
  }
  const bgColor = coloresAsignaturas.value[asignatura]
  const borderColor = oscurecerColor(bgColor)
  return { backgroundColor: bgColor, border: `2px solid ${borderColor}` }
}

function oscurecerColor(hex, factor = 0.7) {
  const rgb = hex.replace('#', '').match(/.{1,2}/g)
  if (!rgb) return '#999'
  const [r, g, b] = rgb.map(c => Math.max(0, Math.min(255, Math.floor(parseInt(c, 16) * factor))))
  return `rgb(${r}, ${g}, ${b})`
}
</script>

<style scoped>
table,
table th,
table td {
  border: 1px dashed black !important;
  border-collapse: separate !important;
}
table {
  border-spacing: 0;
}
</style>
