import api from '../axios.js';
import { useAuthStore } from '../stores/auth';

let bufferActividad = [];
const LIMITE_BUFFER = 10; // Aquí limitamos a 10 eventos, para no saturar el back

export const trackEvento = (tipo, detalle = {}) => {
  const authStore = useAuthStore();
  
  const evento = {
    usuario: authStore.usuario?.username || 'anonimo',
    tipo: tipo,
    detalle: JSON.stringify(detalle),
    url: window.location.pathname,
    fecha: new Date().toISOString()
  };

  bufferActividad.push(evento);

  // una vez que llegamos al limite establecido arriba, entnces si que lo enviamos
  if (bufferActividad.length >= LIMITE_BUFFER) {
    enviarAlServidor();
  }
};

const enviarAlServidor = async () => {
  if (bufferActividad.length === 0) return;
  
  const copiaDatos = [...bufferActividad];
  bufferActividad = []; // Limpiamos el buffer inmediatamente

  try {
    await api.post('/tracking/batch', copiaDatos);
  } catch (error) {
    console.error('Error enviando tracking:', error);
  }
};

// y antes de que se cierre, enviamos lo restante que no ha llegado al limite
window.addEventListener('beforeunload', enviarAlServidor);