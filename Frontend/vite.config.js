import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,
    port: 5173, 
    allowedHosts: [".ngrok-free.dev"],
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
})