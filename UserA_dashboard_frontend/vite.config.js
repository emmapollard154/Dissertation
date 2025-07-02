import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const A_FRONTEND = 5173;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: A_FRONTEND
  },
})
