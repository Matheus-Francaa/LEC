import { test, expect } from '@playwright/test';
import { completeRequiredFields, createDraft, deleteFromList } from './helpers';

test('persists review comments, return decision, resubmission, and approval', async ({ page }) => {
  const name = `Revisão ${Date.now()}`;
  await createDraft(page, name);
  await completeRequiredFields(page);
  await page.locator('.stage-action').click();
  await expect(page).toHaveURL(/\/lec$/);

  await page.getByRole('button', { name: `Revisar ${name}` }).click();
  const comment = 'Detalhar a origem dos dados informados.';
  await page.getByLabel('Comentário para CTX-01').fill(comment);
  await page.locator('.input-group').filter({ has: page.getByLabel('Comentário para CTX-01') })
    .getByRole('button', { name: 'Comentar' }).click();
  await expect(page.getByText(comment)).toBeVisible();
  await page.reload();
  await expect(page.getByText(comment)).toBeVisible();

  await page.getByLabel('Parecer de devolução (obrigatório para devolver)').fill('Esclarecer o tratamento dos dados.');
  await page.getByRole('button', { name: 'Devolver com Parecer' }).click();
  await expect(page).toHaveURL(/\/lec$/);
  await page.getByRole('button', { name: `Editar ${name}` }).click();
  await page.locator('.stage-action').click();
  await expect(page).toHaveURL(/\/lec$/);

  await page.getByRole('button', { name: `Revisar ${name}` }).click();
  await expect(page.getByText(comment)).toBeVisible();
  await page.getByLabel('Plano de execução (obrigatório para aprovar)').fill('Executar em ambiente controlado e monitorar os indicadores.');
  await page.getByRole('button', { name: 'Aprovar LEC e Registrar Plano' }).click();
  await expect(page).toHaveURL(/\/lec$/);
  await expect(page.getByRole('row').filter({ hasText: name }).getByText('APROVADO', { exact: true })).toBeVisible();

  await deleteFromList(page, name);
});
