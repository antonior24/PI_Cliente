import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { trackEvento } from './utils/tracker'



import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App)
app.config.devtools = true

app.use(createPinia())   //  Primero Pinia
app.use(router)          //  Luego el router
app.mount('#app')

// rastreo de clicks
window.addEventListener('click', (e) => {
  trackEvento('CLICK', {
    elemento: e.target.tagName,
    texto: e.target.innerText?.substring(0, 20),
    id: e.target.id || 'sin-id'
  });
});

// rastreo de movimiento
let ultimoMovimiento = 0;
window.addEventListener('mousemove', () => {
  const ahora = Date.now();
  if (ahora - ultimoMovimiento > 5000) { //registramos solo movimento cada 5 seg, para no saturar el back
    trackEvento('MOVIMIENTO_RATON');
    ultimoMovimiento = ahora;
  }
});