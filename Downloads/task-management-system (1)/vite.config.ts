import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',     // <- permite acessar via IP da rede
    port: 3000,          // você pode manter 3000 ou usar 5173
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
})
