import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages serves the site under /<repo>/; local dev and other hosts use '/'.
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
