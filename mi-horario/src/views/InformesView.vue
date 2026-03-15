<template>
  <div class="container mt-4">
    <h2 class="text-center mb-4">Actividad del Usuario</h2>
    <div class="row justify-content-center">
      <div class="col-md-4">
        <div class="card shadow-sm p-3">
          <h5 class="text-center">Eventos</h5>
          <div style="position: relative; height:250px;">
            <canvas id="graficoEventos"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import api from '../axios'; //
import Chart from 'chart.js/auto';

onMounted(async () => {
  try {
    const response = await api.get('/tracking/stats');
    const datos = response.data.porTipo;

    new Chart(document.getElementById('graficoEventos'), {
      type: 'pie',
      data: {
        labels: datos.map(d => d.tipo),
        datasets: [{
          data: datos.map(d => d.total),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
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
    });
  } catch (error) {
    console.error("Error al cargar stats:", error);
  }
});
</script>