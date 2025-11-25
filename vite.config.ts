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
            app = await createServer()
          }
          app(req as Request, res as Response, next as NextFunction)
        } catch (err) {
          next(err)
        }
      })
    },
  }
}

export default defineConfig({
  server: { host: "::", port: 8080 },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
})