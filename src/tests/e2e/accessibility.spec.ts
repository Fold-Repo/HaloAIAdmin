import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', name: 'Home' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
];

for (const { path, name } of pages) {
  test(`${name} page has no critical accessibility violations`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    expect(
      serious,
      serious.map((violation) => `${violation.id}: ${violation.description}`).join('\n'),
    ).toEqual([]);
  });
}
