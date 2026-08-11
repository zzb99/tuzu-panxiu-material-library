import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': '/src' } },
  // The development server is bound to loopback; public access is only through the temporary HTTPS tunnel.
  server: { port: 5174, allowedHosts: true },
})
