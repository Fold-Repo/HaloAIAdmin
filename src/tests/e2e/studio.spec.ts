import { test, expect } from '@playwright/test';

const mockUser = {
  id: 'user-creator-1',
  email: 'creator@example.com',
  name: 'Test Creator',
  role: 'creator',
  emailVerified: true,
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

test('protected studio route redirects unauthenticated users', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});

test('admin route redirects unauthenticated users', async ({ page }) => {
  await page.goto('/admin/overview');
  await expect(page).toHaveURL(/\/login/);
});

test('authenticated creator can open projects page', async ({ page }) => {
  const sessionResponse = {
    success: true,
    data: {
      user: mockUser,
      tokens: { accessToken: 'test-token', refreshToken: 'refresh-token', expiresIn: 3600 },
    },
  };

  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sessionResponse),
    });
  });

  await page.route('**/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sessionResponse),
    });
  });

  await page.route('**/creator/projects**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('creator@example.com');
  await page.locator('#password').fill('Password123!');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL(/\/dashboard/);
  await page.goto('/studio/projects');
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
});
