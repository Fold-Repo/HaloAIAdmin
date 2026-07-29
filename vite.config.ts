import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            if (id.includes('@monaco-editor') || id.includes('monaco-editor')) return 'editor';
            if (id.includes('@tanstack/react-query')) return 'query';
            if (id.includes('react-router')) return 'router';
            if (id.includes('react-dom') || id.includes('react/')) return 'vendor';
            if (id.includes('@radix-ui')) return 'ui';
          }
        },
      },
    },
  },
});
