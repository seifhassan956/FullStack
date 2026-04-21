import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
    '/uploads': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
    base: '/',
  }
})