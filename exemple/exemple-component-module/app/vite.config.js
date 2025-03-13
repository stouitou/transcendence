import { defineConfig } from 'vite';

export default defineConfig({
  base: "/component-alias/",  // ← Important ! Pour que tout soit bien servi sous /component-alias/
  server: {
    cors: true,    
    port: 3000,
    open: true,
    strictPort: true,
    host: "0.0.0.0",
    watch: {
      usePolling: true // Pour Docker
    }
  },
  preview: {
    port: 3000, // S'assurer que Preview tourne aussi sur 3000
    host: "0.0.0.0",
  },
  build: {
    rollupOptions: {
      input: {
       // main: './index.html',
        module: './src/pong-game.ts', // Spécifiez le chemin vers votre module
      },
    },
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
    outDir: 'dist',
  },
});
