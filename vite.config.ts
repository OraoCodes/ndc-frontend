import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      // Allow serving files from the client, shared, and project root
      allow: ["./client", "./shared", "."],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      // createServer returns a Promise<express.Application>
      // Await it so the Express app is mounted before Vite starts handling requests.
      try {
        const app = await createServer();
        server.middlewares.use(app as any);
      } catch (err) {
        // Log and rethrow so the dev server fails early and you see the error.
        // eslint-disable-next-line no-console
        console.error("Failed to initialize express dev middleware:", err);
        throw err;
      }
    },
  };
}
