import { expect, Page } from '@playwright/test';

export async function createDraft(page: Page, name: string): Promise<string> {
  await page.goto('/lec');
  await page.getByRole('link', { name: /NOVO LEC/ }).click();
  await page.getByLabel('Nome da Solução Digital *').fill(name);
  await page.getByLabel('Especialista Responsável').fill('Equipe de testes');
  await page.getByRole('button', { name: 'Criar LEC' }).click();
  await expect(page.locator('#lec-name')).toHaveValue(name);
  await expect(page.locator('#classification-group option', { hasText: 'Transacional' })).toHaveCount(1);
  return new URL(page.url()).pathname.split('/').pop()!;
}

export async function completeRequiredFields(page: Page): Promise<void> {
  await page.locator('#classification-group').selectOption({ label: 'Transacional' });
  await page.locator('#classification-type').fill('Aplicação web');

  await page.getByRole('button', { name: 'ESCOPO', exact: true }).click();
  await page.locator('#question-esc_1').fill('Automatizar o atendimento e registrar as solicitações.');
  await page.locator('#question-esc_2').fill('Servidores e cidadãos; cerca de 500 usuários.');

  await page.getByRole('button', { name: 'CONTEXTO', exact: true }).click();
  for (const id of ['ctx_1', 'ctx_2', 'ctx_3']) {
    await page.locator(`input[name="${id}"][value="Não"]`).check();
  }

  await page.getByRole('button', { name: 'PPD', exact: true }).click();
  for (const id of ['ppd_1', 'ppd_2']) {
    await page.locator(`input[name="${id}"][value="Não"]`).check();
  }

  await page.getByRole('button', { name: 'SEGURANCA', exact: true }).click();
  for (const id of ['seg_1', 'seg_2']) {
    await page.locator(`input[name="${id}"][value="Sim"]`).check();
  }

  await page.getByRole('button', { name: 'ÉTICA', exact: true }).click();
  await page.locator('input[name="etica_1"][value="Não"]').check();
}

export async function deleteFromList(page: Page, name: string): Promise<void> {
  await page.goto('/lec');
  const row = page.getByRole('row').filter({ hasText: name });
  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: `Excluir ${name}` }).click();
  await expect(page.getByText('LEC excluído.')).toBeVisible();
}
