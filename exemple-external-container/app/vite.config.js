import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5555,
    open: true,
  },build: {
    rollupOptions: {
      input: {
        main: './index.html',
        module: './src/pong-game.ts', // Spécifiez le chemin vers votre module
      },
    },
  },
});