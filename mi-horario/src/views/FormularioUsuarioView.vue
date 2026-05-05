<template>
    <div class="container mt-5">
      <h3>Formulario de {{ action === 'create' ? 'creación' : 'edición' }} para el profesor</h3>
  
      <div v-if="profesor">
        <FormularioCrearUsuario
          v-if="action === 'create'"
          :profesor="profesor"
          :is-loading="isLoading"
          @guardar="guardarUsuario"
        />
  
        <FormularioEditarUsuario
          v-else
          :profesor="profesor"
          :is-loading="isLoading"
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
  const isLoading = ref(false)
  
  onMounted(async () => {
  try {
    const response = await axios.get(
      `/api/profesores/${route.params.id}`,
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

  
  // Lógica para guardar o modificar usuario
  async function guardarUsuario(payload) {
    console.log('Guardar (crear):', payload)
    // Implementar si es necesario
  }
  
  async function modificarUsuario(payload) {
    console.log('Modificar usuario:', payload)
    isLoading.value = true
    try {
      const response = await axios.put(
        `/api/usuarios/${payload.idUsuario}`,
        {
          nombre: payload.nombre,
          email: payload.email,
          password: payload.password || null,
          rol: payload.rol
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      console.log('✅ Usuario actualizado:', response.data)
      alert('Usuario actualizado correctamente')
      router.push('/datos-profesorado')
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error)
      alert('Error al actualizar usuario: ' + (error.response?.data || error.message))
    } finally {
      isLoading.value = false
    }
  }
  </script>
  