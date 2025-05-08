import { defineConfig } from 'vite';

import path from 'path';
const allowedHostFromEnv = process.env.BACKEND_SERVER_NAME || 'localhost';
export default defineConfig({
  base: "/frontend-pong-module/",  // ← Important ! Pour que tout soit bien servi sous /component-alias/
  resolve: {
    alias: {
      '/components.js': path.resolve(__dirname, 'src/modules/components.ts'), // Alias pour le fichier de sortie ← garantit que les modules soit bien servi sous /component-alias/components.js en dev et en prod
    },
  },
  server: {
    cors: true,    
    port: 3000,
    open: true,
    strictPort: true,
    host: "0.0.0.0",
    watch: {
      usePolling: true // Pour Docker
    },
    allowedHosts: [
      'localhost',
      allowedHostFromEnv,//'bess-f4r1s3',
    ]
  },
  preview: {
    port: 3000, // S'assurer que Preview tourne aussi sur 3000
    host: "0.0.0.0",
  },
  build: {
    lib: {  // Spécifiez le point d'entrée de votre bibliothèque
      entry: './src/modules/components.ts',
      formats: ['es'],
      fileName: () => 'components.js',
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
    outDir: 'dist',
  },
});
