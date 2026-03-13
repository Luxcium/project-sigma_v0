import { expect, test } from '@playwright/test';

/**
 * E2E tests for the login page.
 *
 * These tests require a running application with a seeded database.
 * Run `bash scripts/first-run.sh` before executing to set up the environment.
 *
 * Dev credentials (from prisma/seed.ts — UNSAFE, dev-only):
 *   Admin: luxcium_tmp@local.dev / pass_UNSAFE_tmp
 *   User:  user@local.dev        / testpassword123
 */

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('displays the login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Screenshot of the initial state
    await page.screenshot({ path: 'e2e/screenshots/login-page.png', fullPage: true });
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('nobody@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for the error alert to appear
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
    expect(await page.getByRole('alert').textContent()).toContain('Invalid email or password');

    await page.screenshot({
      path: 'e2e/screenshots/login-error.png',
      fullPage: true,
    });
  });

  test('shows a validation error for an empty form submission', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    // HTML5 required validation prevents form submission; the email input
    // should remain focused / show browser validation UI.
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeFocused();
  });

  test('redirects to /dashboard after a successful login (USER)', async ({ page }) => {
    await page.getByLabel('Email').fill('user@local.dev');
    await page.getByLabel('Password').fill('testpassword123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // After login, the user should land on the dashboard
    await page.waitForURL('**/dashboard', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/dashboard/);

    await page.screenshot({
      path: 'e2e/screenshots/dashboard-user.png',
      fullPage: true,
    });
  });

  test('redirects to /dashboard after a successful login (ADMIN)', async ({ page }) => {
    await page.getByLabel('Email').fill('luxcium_tmp@local.dev');
    await page.getByLabel('Password').fill('pass_UNSAFE_tmp');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/dashboard', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/dashboard/);

    await page.screenshot({
      path: 'e2e/screenshots/dashboard-admin.png',
      fullPage: true,
    });
  });

  test('admin user can navigate to the admin panel', async ({ page }) => {
    // Log in as admin
    await page.getByLabel('Email').fill('luxcium_tmp@local.dev');
    await page.getByLabel('Password').fill('pass_UNSAFE_tmp');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/dashboard', { timeout: 10_000 });

    // Click the Admin Panel link
    await page.getByRole('link', { name: /Admin Panel/i }).click();
    await page.waitForURL('**/admin', { timeout: 5_000 });
    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();

    await page.screenshot({
      path: 'e2e/screenshots/admin-panel.png',
      fullPage: true,
    });
  });
});

test.describe('Protected routes (unauthenticated)', () => {
  test('redirects /dashboard to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/auth/login', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('redirects /admin to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('**/auth/login', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('redirects / to /dashboard (then to login when not authenticated)', async ({ page }) => {
    await page.goto('/');
    // The home page redirects to /dashboard which redirects to /auth/login
    await page.waitForURL('**/auth/login', { timeout: 5_000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe('Forbidden page', () => {
  test('USER cannot access /admin — gets redirected to /forbidden', async ({ page }) => {
    // Log in as a regular user
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('user@local.dev');
    await page.getByLabel('Password').fill('testpassword123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/dashboard', { timeout: 10_000 });

    // Try to visit /admin directly
    await page.goto('/admin');
    await page.waitForURL('**/forbidden', { timeout: 5_000 });
    await expect(page.getByRole('heading', { name: /403/i })).toBeVisible();

    await page.screenshot({
      path: 'e2e/screenshots/forbidden-page.png',
      fullPage: true,
    });
  });
});
