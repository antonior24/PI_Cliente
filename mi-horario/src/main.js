import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'



import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App)
app.config.devtools = true

app.use(createPinia())   //  Primero Pinia
app.use(router)          //  Luego el router
app.mount('#app')