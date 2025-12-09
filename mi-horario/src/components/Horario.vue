<template>
  <div class="container-fluid pt-4">
    <!-- Vista escritorio -->
    <div class="d-none d-md-block">
      <table class="table table-bordered text-start align-middle w-100 small">
        <thead class="table-dark text-center">
          <tr>
            <th style="width: 100px;">Franja</th>
            <th v-for="dia in diasSemana" :key="dia" style="width: 130px;">{{ dia }}</th>
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
                <strong>Recreo</strong>
              </div>
              <div v-else>
                <div v-for="(clase, i) in getClases(dia, franja)" :key="i" class="mb-1">
                  Aula: {{ clase.aula?.codigo || '-' }}<br />
                  Curso: {{ clase.curso?.nombre || '-' }}<br />
                  Asig: {{ clase.asignatura?.nombre || '-' }}
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
        <strong>{{ diasSemana[diaActualIndex] }}</strong>
        <button class="btn btn-sm btn-outline-secondary" @click="diaSiguiente" :disabled="diaActualIndex === diasSemana.length - 1">→</button>
      </div>
      <table class="table table-bordered text-start align-middle w-100 small">
        <thead class="table-dark text-center">
          <tr>
            <th style="width: 100px;">Franja</th>
            <th style="width: 100%">Horario</th>
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
                <strong>Recreo</strong>
              </div>
              <div v-else>
                <div v-for="(clase, i) in getClases(diaActual, franja)" :key="i" class="mb-1">
                  Aula: {{ clase.aula?.codigo || '-' }}<br />
                  Curso: {{ clase.curso?.nombre || '-' }}<br />
                  Asig: {{ clase.asignatura?.nombre || '-' }}
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

// Props: accept either idProfesor or profesorId (kebab-case from parent), and an explicit fetchAll
const props = defineProps({
  idProfesor: { type: [Number, String], default: null },
  profesorId: { type: [Number, String], default: null },
  fetchAll: { type: Boolean, default: false }
})

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const diaActualIndex = ref(0)
const diaActual = computed(() => diasSemana[diaActualIndex.value])
const horario = ref([])
const route = useRoute()
const idFromRoute = route.params.id || null
// Effective id: prop takes precedence, then route param
const effectiveIdProfesor = props.idProfesor ?? props.profesorId ?? idFromRoute ?? null

const franjasFijas = [
  { idFranja: 'R1', horaInicio: '18:00:00', horaFin: '18:15:00' },
  { idFranja: 'R2', horaInicio: '11:15:00', horaFin: '11:45:00' }
]

const franjasOrdenadas = computed(() => {
  const mapa = new Map()
  for (const h of horario.value) {
    const clave = h.franja.horaInicio
    if (!mapa.has(clave)) mapa.set(clave, h.franja)
  }

  const recreoSiempre = franjasFijas.find(f => f.horaInicio === '11:15:00')
  if (recreoSiempre && !mapa.has(recreoSiempre.horaInicio)) {
    mapa.set(recreoSiempre.horaInicio, recreoSiempre)
  }

  const tieneClasesDespuesDe18 = horario.value.some(h => h.franja.horaInicio > '18:00:00')
  const recreoTarde = franjasFijas.find(f => f.horaInicio === '18:00:00')
  if (tieneClasesDespuesDe18 && recreoTarde && !mapa.has(recreoTarde.horaInicio)) {
    mapa.set(recreoTarde.horaInicio, recreoTarde)
  }

  return Array.from(mapa.values()).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
})

function getClases(dia, franja) {
  return horario.value.filter(
    h => h.dia === dia && h.franja.horaInicio.slice(0, 5) === franja.horaInicio.slice(0, 5)
  )
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

onMounted(async () => {
  try {
    // Do not fetch the entire dataset by default. Fetch only when a professor id is provided
    // or when explicitly requested via fetchAll prop.
    if (!effectiveIdProfesor && !props.fetchAll) {
      horario.value = []
      return
    }

    const url = effectiveIdProfesor
      ? `http://localhost:8081/api/horarios?idProfesor=${effectiveIdProfesor}`
      : 'http://localhost:8081/api/horarios'

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    const diaMap = { L: 'Lunes', M: 'Martes', X: 'Miércoles', J: 'Jueves', V: 'Viernes' }
    horario.value = response.data.map(item => ({ ...item, dia: diaMap[item.dia] || item.dia }))
  } catch (error) {
    console.error('Error al cargar el horario:', error)
  }
})

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
