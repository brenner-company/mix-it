import { expect, test } from '@playwright/test';

test('mobile user can calculate liquid for a reviewed Market Variant', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Catalogus' })).toBeVisible();
  await page.getByRole('link', { name: /Knauf Goldband E/ }).click();

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

test('mobile user can calculate powder and liquid for a direct area', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('button', { name: 'Oppervlakte bedekken' }).click();
  await expect(page.getByRole('textbox', { name: 'Oppervlakte', exact: true })).toHaveValue('');
  await expect(page.getByLabel('Laagdikte')).toHaveValue('10');
  await expect(page.getByLabel('Verspillingsmarge')).toHaveValue('10');

  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  const result = page.getByTestId('area-calculation-result');
  await expect(result).toContainText('Benodigd poeder');
  await expect(result).toContainText('88 kg');
  await expect(result).toContainText('Benodigde vloeistof');
  await expect(result).toContainText('56,3 L');
  await expect(result).toContainText('Oppervlakte');
  await expect(result).toContainText('10 m²');
  await expect(result).toContainText('Laagdikte');
  await expect(result).toContainText('10 mm');
  await expect(result).toContainText('Verspillingsmarge: 10%');
});

test('area calculator accepts mixed dimensions and preserves both area entry modes', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('button', { name: 'Oppervlakte bedekken' }).click();
  const dimensionsMode = page.getByRole('button', { name: 'Breedte en hoogte' });
  await dimensionsMode.click();

  await page.getByRole('textbox', { name: 'Breedte', exact: true }).fill('4');
  await page.getByRole('textbox', { name: 'Hoogte', exact: true }).fill('250');
  await page.locator('#height-unit').selectOption('cm');
  await page.getByLabel('Laagdikte').fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  const result = page.getByTestId('area-calculation-result');
  await expect(result).toContainText('88 kg');
  await expect(result).toContainText('56,3 L');
  await expect(result).toContainText('10 m²');
  await expect(page.getByRole('textbox', { name: 'Breedte', exact: true })).toHaveValue('4');
  await expect(page.getByRole('textbox', { name: 'Hoogte', exact: true })).toHaveValue('250');
  await expect(page.locator('#height-unit')).toHaveValue('cm');

  await page.getByRole('button', { name: 'Rechtstreekse oppervlakte' }).click();
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(result).toContainText('88 kg');
  await expect(result).toContainText('56,3 L');

  await page.getByRole('button', { name: 'Breedte en hoogte' }).click();
  await expect(page.getByRole('textbox', { name: 'Breedte', exact: true })).toHaveValue('4');
  await expect(page.getByRole('textbox', { name: 'Hoogte', exact: true })).toHaveValue('250');
  await expect(page.locator('#height-unit')).toHaveValue('cm');
  await expect(result).toContainText('88 kg');

  await page.getByRole('button', { name: 'Poedermassa' }).click();
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await page.getByRole('button', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('button', { name: 'Rechtstreekse oppervlakte' }).click();
  await expect(page.getByRole('textbox', { name: 'Oppervlakte', exact: true })).toHaveValue('10');
  await page.getByRole('button', { name: 'Breedte en hoogte' }).click();
  await expect(page.getByRole('textbox', { name: 'Breedte', exact: true })).toHaveValue('4');
  await expect(page.getByRole('textbox', { name: 'Hoogte', exact: true })).toHaveValue('250');
});

test('incomplete dimensions are announced without showing a misleading result', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('button', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('button', { name: 'Breedte en hoogte' }).click();
  const width = page.getByRole('textbox', { name: 'Breedte', exact: true });
  const height = page.getByRole('textbox', { name: 'Hoogte', exact: true });
  await width.fill('4');
  await height.fill('2,5');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');
  await height.fill('');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  await expect(page.getByRole('alert')).toHaveText('Voer een positieve breedte en hoogte in.');
  await expect(page.getByTestId('area-calculation-result')).toHaveCount(0);
  await expect(height).toHaveAttribute('aria-invalid', 'true');
});

test('editing shared area assumptions clears results for both entry modes', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('button', { name: 'Oppervlakte bedekken' }).click();
  const result = page.getByTestId('area-calculation-result');
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  await page.getByRole('button', { name: 'Breedte en hoogte' }).click();
  await page.getByRole('textbox', { name: 'Breedte', exact: true }).fill('4');
  await page.getByRole('textbox', { name: 'Hoogte', exact: true }).fill('2,5');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(result).toBeVisible();

  await page.getByLabel('Laagdikte').fill('15');
  await expect(result).toHaveCount(0);
  await page.getByRole('button', { name: 'Rechtstreekse oppervlakte' }).click();
  await expect(result).toHaveCount(0);
});

test('dimension entry fits a touch-sized viewport without horizontal scrolling', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByRole('button', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('button', { name: 'Breedte en hoogte' }).click();

  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('area mode warns when layer thickness is outside manufacturer guidance', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('button', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByLabel('Laagdikte').fill('30');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  await expect(page.getByRole('alert')).toContainText('buiten de richtlijnen van de fabrikant');
  await expect(page.getByRole('alert')).toContainText('5–25 mm');
  await expect(page.getByTestId('area-calculation-result')).toContainText('264 kg');
});

test('area mode is disabled when a Market Variant has no Reference Thickness', async ({ page }) => {
  await page.goto('/product/knauf-mixem-light-be');

  const areaMode = page.getByRole('button', { name: 'Oppervlakte bedekken' });
  await expect(areaMode).toBeDisabled();
  await expect(page.getByText(/niet beschikbaar.*Reference Thickness/i)).toBeVisible();
  await expect(page.getByLabel('Poedermassa')).toBeVisible();
});

test('catalog discovery searches, filters, and hides unreviewed Market Variants', async ({ page }) => {
  await page.goto('/');

  const search = page.getByLabel('Zoek op naam, fabrikant, productcode of categorie');
  const manufacturerFilter = page.getByLabel('Filter op fabrikant');

  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(2);
  await expect(manufacturerFilter).toBeVisible();
  await expect(manufacturerFilter).toHaveValue('');

  await search.fill('  knauf belgium  ');
  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(2);

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
