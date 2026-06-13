import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ↓ Set this to match your GitHub repo name:
  //   '/PRISM/'  → for repo named "PRISM"  (site at username.github.io/PRISM/)
  //   '/'        → for repo named "username.github.io" (site at username.github.io/)
  base: '/PRISM/',
})
