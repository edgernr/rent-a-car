import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// API base is relative ('/api/...'); in dev Vite proxies it to the local API,
// in prod vercel.json proxies it to the deployed API. Either way the session
// cookie stays first-party on the console's own origin.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
});
