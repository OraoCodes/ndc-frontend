// vite.config.ts
import { defineConfig, Plugin } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"
import type { Request, Response, NextFunction } from "express"
import { createServer } from "./server"

let app: any = null

function expressPlugin(): Plugin {
  return {
    name: "express-dev-server",
    async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (!app) {
            console.log("Starting Express server...")
            app = await createServer()
            console.log("Express server ready")
          }
          app(req as Request, res as Response, next as NextFunction)
        } catch (err) {
          console.error("Express server error:", err)
          next(err)
        }
      })
    },
  }
}

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },

  // THIS IS THE FIX FOR DEPLOYMENT
  build: {
    outDir: "dist/spa",      // Vite will now output client files here
    emptyOutDir: true,       // Clean the folder on each build
  },

  plugins: [react(), expressPlugin()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
})