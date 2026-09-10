import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' garante que os assets funcionem em qualquer subpasta do public_html na Hostinger
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
    watch: {
      ignored: ['**/public/favicon.png'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
});
