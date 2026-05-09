import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy `/api` requests to the API Gateway during development to avoid CORS.
    // API Gateway runs on port 7069 and routes requests to appropriate microservices.
    proxy: {
      '/api': {
        target: 'http://localhost:7069',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})