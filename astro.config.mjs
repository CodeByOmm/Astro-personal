import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import {
  defineConfig
} from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Pre-bundle these dependencies
      include: ['flyonui', 'flatpickr']
    },
    build: {
      rollupOptions: {
        // Ensure external libraries are properly bundled
        external: []
      }
    }
  }
});