import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Base should match the repository name for GitHub Pages publishing
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, '../writing-editor/index.html')
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
})
