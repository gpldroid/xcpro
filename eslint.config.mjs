import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'assets/**',
      'tools/**',
      'pages/**',
      'docs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
);
