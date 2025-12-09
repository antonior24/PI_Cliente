<template>
      <!-- Botón tipo "bocadillo" arriba a la izquierda -->
     
      <div class="position-fixed top-0 start-0 z-3" style="margin-top: 80px; margin-left: 12px;">
      <button
        class="btn btn-outline-light bg-dark border-0 shadow"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#sidePanel"
        style="font-size: 1.5rem; padding: 8px 16px;"
      >
        &#9776;
      </button>
    </div>



    <!-- Contenido del home -->
    <div class="container mt-5 pt-5">
      <Horario />
    </div>

    <!-- Offcanvas lateral -->
    <div class="offcanvas offcanvas-start" tabindex="-1" id="sidePanel" aria-labelledby="sidePanelLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="sidePanelLabel">Menú lateral</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
        
      </div>

      <div class="offcanvas-body">
        <input
          ref="fileInput"
          type="file"
          @change="handleFileUpload"
          style="display: none"
        />

        <router-link to="/home" class="btn btn-primary w-100 mb-2">
          Inicio
        </router-link>
        <button class="btn btn-primary w-100 mb-2" @click="triggerFileSelect">
          Subir archivo de datos
        </button>
        <router-link to="/datos-profesorado" class="btn btn-primary w-100 mb-2">
          Datos profesorado
        </router-link>

        <button class="btn btn-primary w-100 mb-2">Generar partes diario</button>
        <button class="btn btn-primary w-100 mb-2">Ausencia</button>
      </div>
    </div>


    <div class="container mt-5">
      <h2>{{ profesor?.nombre }}</h2>
  
      <div class="d-flex align-items-center mb-3">
        <img
          src="https://via.placeholder.com/80"
          alt="Foto del profesor"
          class="rounded-circle me-3"
        />
        <div class="btn-group">
          <button class="btn btn-success">Crear usuario</button>
          <button class="btn btn-warning">Modificar usuario</button>
          <button class="btn btn-danger">Borrar usuario</button>
        </div>
      </div>
  
      <Horario :profesor-id="profesor?.id" />
    </div>
  </template>




  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import axios from 'axios'
  import Horario from '../components/Horario.vue'
  
  const route = useRoute()
  const profesor = ref(null)
  
  onMounted(async () => {
    const id = route.params.id
    try {
      const response = await axios.get(`http://localhost:8081/api/profesores/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      profesor.value = response.data
    } catch (error) {
      console.error('Error al obtener el profesor:', error)
    }
  })
  </script>
  