import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standalone CMS admin panel.
// In development, /api and /uploads are proxied to the Flask backend on :5000.
// In production set VITE_API_URL to the deployed backend URL.
export default defineConfig(() => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
}))
