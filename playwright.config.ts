import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration.
 *
 * Locally the Next.js dev server is started automatically.
 * In CI the production server is started automatically (after `npm run build`).
 *
 * @see https://playwright.dev/docs/test-configuration
 */

const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  /* Run tests in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Limit workers on CI to avoid resource contention */
  ...(isCI ? { workers: 1 } : {}),
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    /* Base URL — override with BASE_URL env var in CI */
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:3000',
    /* Capture a screenshot on every test failure */
    screenshot: 'only-on-failure',
    /* Record a video on first retry */
    video: 'on-first-retry',
    /* Collect trace on first retry */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  /* Start the server automatically — dev server locally, production server in CI */
  webServer: {
    command: isCI ? 'npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
