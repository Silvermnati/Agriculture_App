import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This mirrors the `baseUrl` in `jsconfig.json` and fixes the "Failed to resolve import" errors.
      // It allows you to use absolute paths from the `src` directory.
      // e.g., `import ... from 'store/postsSlice'`
      components: path.resolve(__dirname, './src/components'),
      pages: path.resolve(__dirname, './src/pages'),
      store: path.resolve(__dirname, './src/store'),
      utils: path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to the Flask backend to avoid CORS issues during development.
      // This will forward any request starting with /api to the backend.
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
