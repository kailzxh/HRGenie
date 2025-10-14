import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // ✅ ADD THIS SERVER CONFIGURATION
  server: {
    proxy: {
      // Forward any request that starts with "/api" to your backend server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  }
})