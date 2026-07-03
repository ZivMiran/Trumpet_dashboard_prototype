import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Trumpet_dashboard_prototype/',
  plugins: [react()],
})
