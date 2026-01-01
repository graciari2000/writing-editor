import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base should match the repository name for GitHub Pages publishing
export default defineConfig({
  base: '/writing-editor/',
  plugins: [react()]
})
