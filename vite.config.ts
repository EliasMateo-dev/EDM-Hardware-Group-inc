import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_VEXOR_PROJECT': JSON.stringify(process.env.VEXOR_PROJECT),
    'import.meta.env.VITE_VEXOR_PUBLISHABLE_KEY': JSON.stringify(process.env.VEXOR_PUBLISHABLE_KEY),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
