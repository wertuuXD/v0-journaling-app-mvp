import { test, expect } from '@playwright/test';

test('core journaling workflow', async ({ page }) => {
  // 1. Navigate to the app
  await page.goto('/');

  // 2. Click "New entry" button
  await page.getByRole('button', { name: /new entry/i }).click();

  // 3. Write content
  const editor = page.getByPlaceholder(/mind/i);
  await editor.fill('Today was a great day for testing!');

  // 4. Select a mood (Happy)
  await page.getByLabel('Happy mood').click();

  // 5. Save the entry
  await page.getByRole('button', { name: /save entry/i }).click();

  // 6. Verify entry appears in timeline
  // The app usually navigates to timeline or shows a success toast
  // Based on the code, let's assume it stays or we can navigate to timeline
  await page.getByRole('button', { name: /timeline/i }).click();

  await expect(page.getByText('Today was a great day for testing!')).toBeVisible();
  await expect(page.getByText('😊')).toBeVisible();

  // 7. Delete the entry
  await page.getByText('Today was a great day for testing!').click();
  await page.getByRole('button', { name: /delete/i }).click();

  // Confirm deletion in alert dialog
  await page.getByRole('button', { name: /delete/i, includeHidden: true }).filter({ hasText: 'Delete' }).last().click();

  // 8. Verify entry is removed
  await expect(page.getByText('Today was a great day for testing!')).not.toBeVisible();
});
