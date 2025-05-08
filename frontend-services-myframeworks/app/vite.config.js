import { defineConfig } from 'vite';

const allowedHostFromEnv = process.env.BACKEND_SERVER_NAME || 'localhost';
export default defineConfig({
  server: {
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
  publicDir: 'public',
  preview: {
    port: 3000, // S'assurer que preview tourne aussi sur 3000
    host: "0.0.0.0",
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    outDir: 'dist',
  },
});
