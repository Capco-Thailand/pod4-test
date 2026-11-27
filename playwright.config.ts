import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  outputDir: 'test-results/fr-03/artifacts',
  timeout: 30000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:4173',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: 'retain-on-failure',
    screenshot: 'on',
  },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }],
  reporter: [
    ['html', { outputFolder: 'test-results/fr-03/current', open: 'never' }],
  ],
});
