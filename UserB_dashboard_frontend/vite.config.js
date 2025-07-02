import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const B_FRONTEND = 6173;
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: B_FRONTEND
  },
})
