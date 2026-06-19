import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Proxy /critique to the Express critique proxy (M11) so the client can fetch a
// relative URL with no CORS and the Anthropic key stays server-side.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/critique': 'http://localhost:8787',
    },
  },
})
