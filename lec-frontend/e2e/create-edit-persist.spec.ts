import { test, expect } from '@playwright/test';
import { createDraft, deleteFromList } from './helpers';

test('creates a LEC, persists edits across reloads, and deletes it', async ({ page }) => {
  const name = `Persistência ${Date.now()}`;
  await createDraft(page, name);

  await page.locator('#classification-group').selectOption({ label: 'Analytics' });
  await page.locator('#classification-type').fill('Painel operacional');
  await page.locator('.save-action').click();
  await expect(page.getByText('Alterações salvas com sucesso.')).toBeVisible();

  await page.goto('/lec');
  await expect(page.getByText(name)).toBeVisible();
  await page.getByRole('button', { name: `Editar ${name}` }).click();
  await expect(page.locator('#classification-group')).toHaveValue('Analytics');
  await expect(page.locator('#classification-type')).toHaveValue('Painel operacional');

  await deleteFromList(page, name);
  await expect(page.getByText(name)).toHaveCount(0);
});
