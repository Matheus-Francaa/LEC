import { test, expect } from '@playwright/test';
import { createDraft, deleteFromList } from './helpers';

test('rejects sending a draft with required fields missing', async ({ page }) => {
  const name = `Validação ${Date.now()}`;
  await createDraft(page, name);

  await page.locator('.stage-action').click();
  await expect(page.getByText('Preencha os campos obrigatórios antes de enviar.')).toBeVisible();
  await expect(page.locator('#classification-group')).toHaveClass(/is-invalid/);
  await expect(page.locator('#classification-type')).toHaveClass(/is-invalid/);

  await deleteFromList(page, name);
});
