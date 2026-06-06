// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  build: {
    inlineStylesheets: 'always',
    assets: '_astro',
  },
  vite: {
    build: {
      assetsInlineLimit: 1000000, // inline everything up to 1MB
      cssCodeSplit: false,
    },

    plugins: [tailwindcss()],
  },
});