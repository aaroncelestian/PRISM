import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/PRISM/',  // change to '/' if deploying as a user/org page (username.github.io)
})
