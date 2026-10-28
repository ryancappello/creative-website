import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/creative-website/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        personal: new URL('./index.html', import.meta.url).pathname,
        venture: new URL('./smart-sort/index.html', import.meta.url).pathname,
      },
    },
  },
})
