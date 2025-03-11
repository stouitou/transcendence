import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    strictPort: true,
    watch: {
      usePolling: true // Pour Docker
    }
  },build: {
    rollupOptions: {
      input: {
        main: './index.html',
        module: './src/pong-game.ts', // Spécifiez le chemin vers votre module
      },
    },
  },
});

/*
export default defineConfig({
  server: {
    port: 3000,
    open: true,
    strictPort: true,
    watch: {
      usePolling: true // Pour Docker
    }
  }
});*/