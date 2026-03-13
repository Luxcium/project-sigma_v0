import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration.
 *
 * Tests run against a live Next.js dev server started automatically by
 * the `webServer` option.  Set the `BASE_URL` env var to run against a
 * separately started server (e.g. in CI after `npm run build && npm start`).
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
  /* Auto-start the Next.js dev server when running locally */
  ...(!isCI
    ? {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }
    : {}),
});
