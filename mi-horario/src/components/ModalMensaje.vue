<template>
    <div v-if="visible" class="modal-overlay">
      <div class="modal-content" :class="modalClass">
        <button class="close-btn" @click="$emit('cerrar')">×</button>
        <h5 class="mb-3">{{ titulo }}</h5>
        <p>{{ mensaje }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    visible: Boolean,
    titulo: String,
    mensaje: String,
    tipo: {
      type: String,
      default: 'info'
    }
  })
  
  const emit = defineEmits(['cerrar'])
  
  const modalClass = computed(() => {
    switch (props.tipo) {
      case 'error': return 'modal-error'
      case 'success': return 'modal-success'
      case 'warning': return 'modal-warning'
      default: return 'modal-info'
    }
  })
  </script>
  
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 10px;
    max-width: 400px;
    width: 90%;
    position: relative;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    text-align: center;
    transition: all 0.3s ease;
  }
  
  /* Tipos de modal */
  .modal-success {
    border-left: 8px solid #198754;
  }
  .modal-error {
    border-left: 8px solid #dc3545;
  }
  .modal-info {
    border-left: 8px solid #0d6efd;
  }
  .modal-warning {
    border-left: 8px solid #ffc107;
  }
  
  .close-btn {
    position: absolute;
    top: 8px;
    right: 12px;
    border: none;
    background: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
  </style>
  