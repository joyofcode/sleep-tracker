import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/oura': {
        target: 'https://api.ouraring.com',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const endpoint = url.searchParams.get('endpoint') || '';
          const startDate = url.searchParams.get('start_date') || '';
          const endDate = url.searchParams.get('end_date') || '';
          return `/v2/usercollection/${endpoint}?start_date=${startDate}&end_date=${endDate}`;
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const token = process.env.VITE_OURA_TOKEN || '';
            proxyReq.setHeader('Authorization', `Bearer ${token}`);
          });
        },
      },
    },
  },
})
