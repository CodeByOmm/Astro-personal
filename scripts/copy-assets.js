// scripts/copy-assets.js
import { copyFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const assets = {
  flatpickr: {
    src: ['flatpickr/dist/flatpickr.js', 'flatpickr/dist/flatpickr.css'],
  },
  flyonui: {
    src: ['flyonui/flyonui.js'],
  },
  'tailwindcss-intersect': {
    src: ['tailwindcss-intersect/dist/observer.min.js'],
  },
  // add more libs here …
};

const initPath   = resolve(__dirname, '../node_modules');
const outputPath = resolve(__dirname, '../public/assets/libs');

mkdirSync(outputPath, { recursive: true });

for (const { src } of Object.values(assets)) {
  for (const srcFile of src) {
    const srcPath  = join(initPath, srcFile);
    const destPath = join(outputPath, srcFile);

    try {
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcFile}`);
    } catch (err) {
      console.error(`Failed ${srcFile}:`, err.message);
      process.exitCode = 1;   // let the build fail if a file is missing
    }
  }
}