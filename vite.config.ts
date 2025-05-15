import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, './src/components'),
    },
  },
  server: {
    allowedHosts: ['.csb.app'], // 👈 das erlaubt alle Codesandbox-Hosts
  },
});
