import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import PerfilView from '../views/PerfilView.vue'
import datosprofesoradoView from '../views/DatosProfesoradoView.vue'
import datosprofesor from '../views/DatosProfesor.vue'
import FormularioUsuarioView from '../views/FormularioUsuarioView.vue'
import AusenciasProfesorView from '../views/AusenciasProfesorView.vue'
import DatosUsuarioView from '../views/DatosUsuarioView.vue'




const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/home', component: HomeView },
  { path: '/perfil', component: PerfilView },
  { path: '/datos-profesorado', component: datosprofesoradoView },
  { path: '/profesor/:id', component: datosprofesor },
  { path: '/formulario/:id', component: FormularioUsuarioView },
  { path: '/mis-ausencias', component: AusenciasProfesorView },
  { path: '/datosusuario/:id', component: DatosUsuarioView },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
