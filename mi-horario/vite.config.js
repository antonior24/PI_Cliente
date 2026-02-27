import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,      // Permite que Docker acceda al servidor
    port: 5147,      // Forzamos el puerto que pide tu guía
    watch: {
      usePolling: true, // RELEVANTE: Obliga a Vite a revisar cambios manualmente
      interval: 100,    // Revisa cada 100ms
    },
  },
})
