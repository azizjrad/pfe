import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate heavy dependencies to improve caching
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-mui": ["@mui/material", "@emotion/react", "@emotion/styled"],
          "vendor-charts": ["recharts"],
          "vendor-http": ["axios"],
        },
      },
    },
    // Code splitting optimization:
    // - Lazy loading splits routes into separate chunks
    // - Manual chunks isolate vendor dependencies
    // - This reduces main bundle and enables parallel loading
    chunkSizeWarningLimit: 600,
  },
});
