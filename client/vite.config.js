import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://agriculture-app-1-u2a6.onrender.com',
        changeOrigin: true,
      },
    },
  },
});