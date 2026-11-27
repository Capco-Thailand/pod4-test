import { defineConfig } from 'vitest/config';
export default defineConfig({
  server: {
    proxy: { '/api': process.env.API_PROXY ?? 'http://localhost:3000' },
  },
  test: { environment: 'jsdom', setupFiles: ['./src/test-setup.ts'] },
});
