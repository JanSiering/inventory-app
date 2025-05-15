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
  host: true,
  strictPort: false,
  watch: {
    usePolling: true,
  },
  allowedHosts: 'all', // 👈 das ist der wichtige Teil!
}
