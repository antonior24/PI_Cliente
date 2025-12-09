<template>
    <div class="container mt-5">
      <h3>Formulario de {{ action === 'create' ? 'creación' : 'edición' }} para el profesor</h3>
  
      <div v-if="profesor">
        <FormularioCrearUsuario
          v-if="action === 'create'"
          :profesor="profesor"
          @guardar="guardarUsuario"
        />
  
        <FormularioEditarUsuario
          v-else
          :profesor="profesor"
          @actualizar="modificarUsuario"
        />
      </div>
  
      <div v-else class="text-center mt-4">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Cargando datos del profesor...</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import axios from 'axios'
  
  import FormularioCrearUsuario from '../components/FormularioCrearUsuario.vue'
  import FormularioEditarUsuario from '../components/FormularioEditarUsuario.vue'
  
  const route = useRoute()
  const router = useRouter()
  
  const profesor = ref(null)
  const action = ref(route.query.action || 'create')
  
  onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:8081/api/profesores/${route.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    profesor.value = response.data
    console.log('📦 Profesor cargado:', profesor.value)
  } catch (err) {
    console.error(' Error al cargar el profesor', err)
    router.push('/datos-profesorado')
  }
})

  
  // Agregá tu lógica para guardar o modificar si querés manejarla desde aquí
  function guardarUsuario(payload) {
    console.log('Guardar (crear):', payload)
  }
  
  function modificarUsuario(payload) {
    console.log('Guardar (editar):', payload)
  }
  </script>
  