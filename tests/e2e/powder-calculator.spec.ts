import { expect, test } from '@playwright/test';

test('mobile user can calculate liquid for a reviewed Market Variant', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Catalogus' })).toBeVisible();
  await page.getByRole('link', { name: /open calculator/i }).click();

  await expect(page.getByRole('heading', { name: 'Knauf Goldband E', exact: true })).toBeVisible();
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();

  await expect(page.getByTestId('calculation-result')).toContainText('8,0 L');
  await expect(page.getByTestId('calculation-result')).toContainText('12,5 kg');
  await expect(page.getByText('Strooi een zak van 25 kg')).toBeVisible();
  await expect(page.getByText('Enkele minuten', { exact: true })).toBeVisible();
  await expect(page.getByText('Ongeveer 2,5 tot 3 uur')).toBeVisible();
  await expect(page.getByText('Dit is een berekening op basis van de ingevoerde poedermassa.')).toBeVisible();
  await expect(page.getByText('Laatst gereviewd: 2025-02-03')).toBeVisible();
});

test('catalog discovery searches, filters, and hides unreviewed Market Variants', async ({ page }) => {
  await page.goto('/');

  const search = page.getByLabel('Zoek op naam, fabrikant, productcode of categorie');
  const manufacturerFilter = page.getByLabel('Filter op fabrikant');

  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(1);
  await expect(manufacturerFilter).toBeVisible();
  await expect(manufacturerFilter).toHaveValue('');

  await search.fill('  knauf belgium  ');
  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(1);

  await search.fill('P252');
  await expect(page.getByText('Geen Market Variants gevonden.')).toBeVisible();

  await search.fill('P131');
  await manufacturerFilter.selectOption({ label: 'Knauf Belgium' });
  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(1);

  await manufacturerFilter.selectOption({ label: 'Alle fabrikanten' });
  await expect(manufacturerFilter).toHaveValue('');
  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(1);
});

test('invalid powder input is announced without showing a calculation', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  const powderInput = page.getByLabel('Poedermassa');
  await powderInput.fill('-2');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();

  await expect(page.getByRole('alert')).toHaveText('Voer een positieve poedermassa in, bijvoorbeeld 12,5.');
  await expect(page.getByTestId('calculation-result')).toHaveCount(0);
  await expect(powderInput).toHaveAttribute('aria-invalid', 'true');
});

test('unreviewed Market Variants cannot be opened by direct navigation', async ({ page }) => {
  await page.goto('/product/knauf-mixem-basic-be-draft');

  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Knauf MiXem Basic' })).toHaveCount(0);
});
