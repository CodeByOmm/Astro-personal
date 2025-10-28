import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const assets = {
    flatpickr: {
    src: ['flatpickr/dist/flatpickr.js', 'flatpickr/dist/flatpickr.css']
  },
   flyonui: {
    src: ['flyonui/flyonui.js']
  },
    'tailwindcss-intersect': {
    src: ['tailwindcss-intersect/dist/observer.min.js']
  }
};

const initPath = resolve(__dirname, '../node_modules');
const outputPath = resolve(__dirname, '../public/assets/libs');

// Ensure the output directory exists
mkdirSync(outputPath, { recursive: true });

// Copy all assets
Object.values(assets).forEach(asset => {
  asset.src.forEach(srcFile => {
    try {
      const src = join(initPath, srcFile);
      const dest = join(outputPath, srcFile);
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(src, dest);
      console.log(`Successfully copied ${srcFile}`);
    } catch (error) {
      console.error(`Error copying ${srcFile}:`, error);
      // Don't throw, continue with other files
    }
  });
});