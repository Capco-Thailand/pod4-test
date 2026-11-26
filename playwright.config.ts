import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  outputDir: 'test-results/fr-01/artifacts',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'on',
  },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
  reporter: [
    ['html', { outputFolder: 'test-results/fr-01/current', open: 'never' }],
  ],
});
