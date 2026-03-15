import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000'
    }
  },
  build: {
    // Generate source maps for debugging (optional, remove for smallest size)
    sourcemap: false,
    // Target modern browsers for smaller output
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached independently, rarely changes
          'vendor-react': ['react', 'react-dom'],
          // Routing — separate chunk, changes less often than app code
          'vendor-router': ['react-router-dom'],
          // HTTP client — small but separate
          'vendor-axios': ['axios'],
          // Internationalization — loaded once, cached
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // Icons library — can be large, cache independently
          'vendor-icons': ['lucide-react'],
          // Charting library — only needed on dashboard pages
          'vendor-charts': ['recharts'],
        },
      },
    },
    // Increase chunk size warning limit (since we intentionally create chunks)
    chunkSizeWarningLimit: 500,
  },
})
