import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    matchers: {
      extend: {
        toBeInTheDocument: 'jest-dom/matchers',
      },
    },
  },
});