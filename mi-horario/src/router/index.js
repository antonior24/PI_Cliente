import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import PerfilView from '../views/PerfilView.vue'
import datosprofesoradoView from '../views/DatosProfesoradoView.vue'
import datosprofesor from '../views/DatosProfesor.vue'
import FormularioUsuarioView from '../views/FormularioUsuarioView.vue'
import AusenciasProfesorView from '../views/AusenciasProfesorView.vue'
import DatosUsuarioView from '../views/DatosUsuarioView.vue'
import SubirArchivoView from '../views/SubirArchivoView.vue'
import { trackEvento } from '../utils/tracker'


import GuardiasView from '../views/GuardiasView.vue'
import HorarioAIView from '../views/HorarioAIView.vue'


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/home', component: HomeView },
  { path: '/perfil', component: PerfilView },
  { path: '/datos-profesorado', component: datosprofesoradoView },
  { path: '/profesor/:id', component: datosprofesor },
  { path: '/formulario/:id', component: FormularioUsuarioView },
  { path: '/mis-ausencias', component: AusenciasProfesorView },
  { path: '/guardias', component: GuardiasView },
  { path: '/datosusuario/:id', component: DatosUsuarioView },
  { path: '/subir-archivo', component: SubirArchivoView },
  { path: '/informes', component: () => import('../views/InformesView.vue') },
  { path: '/horario/ia', component: HorarioAIView },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  trackEvento('VISTA_PAGINA', { nombre: to.path });
});

export default router
