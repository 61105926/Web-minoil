import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../backend/public',
    emptyOutDir: false, // No vaciar el directorio porque contiene archivos estáticos
    copyPublicDir: true, // Asegurar que se copien los archivos de public/
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/empleados': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/reemplazo-cerveza': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/productos': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/impostor': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/salas': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
    },
  },
})
