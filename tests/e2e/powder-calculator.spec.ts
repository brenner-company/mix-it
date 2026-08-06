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
  await page.getByLabel('Poedermassa').fill('12.5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await expect(page.getByTestId('calculation-result')).toContainText('8,0 L');
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

  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10.0');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(result).toContainText('56,3 L');
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

test('reviewed initial Market Variants expose calculator modes justified by their Source Documents', async ({ page }) => {
  await page.goto('/product/knauf-mixem-light-be');

  const areaMode = page.getByRole('button', { name: 'Oppervlakte bedekken' });
  await expect(areaMode).not.toBeDisabled();
  await areaMode.click();
  await expect(page.getByLabel('Laagdikte')).toHaveValue('15');
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('1');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  const result = page.getByTestId('area-calculation-result');
  await expect(result).toContainText('20,13 kg');
  await expect(result).toContainText('5,4 L');
  await expect(page.getByText('Strooi een zak van 25 kg in ongeveer 6,7 liter')).toBeVisible();
  await expect(page.getByText('Minstens 1 dag per mm laagdikte vóór afwerking')).toBeVisible();
  await expect(page.getByText('Laatst gereviewd: 2025-02-03')).toBeVisible();
});

test('MiXem Basic exposes reviewed powder and area calculations with source timings', async ({ page }) => {
  await page.goto('/product/knauf-mixem-basic-be');

  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await expect(page.getByTestId('calculation-result')).toContainText('2.350 ml');
  await expect(page.getByText('Voeg ongeveer 4,7 liter zuiver leidingwater')).toBeVisible();
  await expect(page.getByText('3 tot 4 minuten', { exact: true })).toBeVisible();
  await expect(page.getByText('Minstens 1 dag per mm pleisterdikte vóór afwerking')).toBeVisible();
  await expect(page.getByText('Laatst gereviewd: 2025-02-04')).toBeVisible();

  await page.getByRole('button', { name: 'Oppervlakte bedekken' }).click();
  await expect(page.getByLabel('Laagdikte')).toHaveValue('15');
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('1');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('25,41 kg');
  await expect(page.getByTestId('area-calculation-result')).toContainText('4.780 ml');
});

test('catalog discovery searches, filters, and hides unreviewed Market Variants', async ({ page }) => {
  await page.goto('/');

  const search = page.getByLabel('Zoek op naam, fabrikant, productcode of categorie');
  const manufacturerFilter = page.getByLabel('Filter op fabrikant');

  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(3);
  await expect(manufacturerFilter).toBeVisible();
  await expect(manufacturerFilter).toHaveValue('');

  await search.fill('  knauf belgium  ');
  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(3);

  await search.fill('P252');
  await expect(page.getByRole('link', { name: /Knauf MiXem Basic/ })).toHaveCount(1);

  await search.fill('P291');
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
  await page.goto('/product/knauf-mixem-sub-be');

  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Knauf MiXem Sub' })).toHaveCount(0);
});

test('Market and Language selections stay independent across a differently named Market Variant', async ({
  page
}) => {
  await page.goto('/');

  const language = page.getByLabel('Taal');

  await language.selectOption('en');
  const market = page.getByLabel('Market');
  await expect(market).toHaveValue('BE');
  await expect(page.getByRole('link', { name: /Knauf Goldband E/ })).toBeVisible();

  await market.selectOption('UK');
  await expect(market).toHaveValue('UK');
  await expect(
    page.getByRole('region', { name: 'Catalog' }).getByText('United Kingdom', { exact: true })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Knauf Multi Finish/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Knauf Goldband E/ })).toHaveCount(0);

  await page.getByRole('link', { name: /Knauf Multi Finish/ }).click();
  await expect(page.getByRole('heading', { name: 'Knauf Multi Finish', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'P127 - Knauf Multi Finish' })).toBeVisible();

  await page.getByLabel('Language').selectOption('nl');
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await expect(page.getByText('Voeg een zak van 25 kg toe aan ongeveer 11,5 liter')).toBeVisible();
  await expect(page.getByLabel('Markt')).toHaveValue('UK');
});

test('Market and Language preferences persist across reloads', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Markt').selectOption('UK');
  await page.getByLabel('Taal').selectOption('en');
  await page.reload();

  await expect(page.getByLabel('Language')).toHaveValue('en');
  await expect(page.getByLabel('Market')).toHaveValue('UK');
  await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Knauf Multi Finish/ })).toBeVisible();
});

test('saved Market preference resolves direct calculator navigation to its Market Variant', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Markt').selectOption('UK');

  await page.goto('/product/knauf-goldband-e-be');

  await expect(page).toHaveURL(/\/product\/knauf-goldband-e-uk$/);
  await expect(page.getByRole('heading', { name: 'Knauf Multi Finish', exact: true })).toBeVisible();
});

test('changing Market clears a previously calculated area result', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByRole('button', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toBeVisible();

  await page.getByLabel('Markt').selectOption('UK');
  await expect(page).toHaveURL(/\/product\/knauf-goldband-e-uk$/);
  await expect(page.getByTestId('area-calculation-result')).toHaveCount(0);
});

test('UK Market accepts comma and point input and formats liquid thresholds', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-uk');
  await page.getByLabel('Taal').selectOption('en');

  const powder = page.getByLabel('Powder mass');
  const calculate = page.getByRole('button', { name: /calculate liquid/i });
  const result = page.getByTestId('calculation-result');

  await powder.fill('1');
  await calculate.click();
  await expect(result).toContainText('460 ml');

  await powder.fill('7,0');
  await calculate.click();
  await expect(result).toContainText('3,220 ml');

  await powder.fill('12.0');
  await calculate.click();
  await expect(result).toContainText('5.5 L');
  await expect(page.getByText('Displayed quantities follow the selected Market, for example 5.0 L.')).toBeVisible();
  await expect(page.getByText('Add one 25 kg bag to approximately 11.5 litres')).toBeVisible();

  await page.getByRole('button', { name: 'Area to cover' }).click();
  await page.getByRole('textbox', { name: 'Area', exact: true }).fill('10,0');
  await page.getByRole('button', { name: /calculate powder and liquid/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');
  await expect(page.getByTestId('area-calculation-result')).toContainText('40.5 L');
  await page.getByRole('textbox', { name: 'Area', exact: true }).fill('10.0');
  await page.getByRole('button', { name: /calculate powder and liquid/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('40.5 L');
});

test.describe('browser Market defaults', () => {
  test.use({ locale: 'en-GB' });

  test('uses the browser region when no Market preference exists', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByLabel('Markt')).toHaveValue('UK');
    await expect(page.getByRole('link', { name: /Knauf Multi Finish/ })).toBeVisible();

    await page.goto('/product/knauf-goldband-e-be');
    await expect(page).toHaveURL(/\/product\/knauf-goldband-e-uk$/);
  });
});
