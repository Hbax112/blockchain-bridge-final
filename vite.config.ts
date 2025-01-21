import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // (Optional) If you need to alias '@mysten/sui.js':
  resolve: {
    alias: {
      "@mysten/sui.js": "@mysten/sui.js/dist/cjs",
    },
  },

  // 1) Add the `optimizeDeps.exclude` section
  optimizeDeps: {
    exclude: [
      'move-contracts', // name of the folder you want to exclude
    ],
  },
});
