import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The 3D experience is lazy-loaded (see src/App.tsx), so three.js and
// react-three-fiber land in their own chunk and the page text paints first.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1300,
  },
})
