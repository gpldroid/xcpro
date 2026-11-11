import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://xconvert.pro',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [react()],
  build: { format: 'preserve' },
});
