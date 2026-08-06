import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { RELEASE_CACHE_PREFIX } from '../../src/lib/offline-release';

async function selectPreference(
  page: Page,
  label: string,
  option: string
): Promise<void> {
  await page.getByRole('button', { name: label }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

function preferenceTrigger(page: Page, label: string) {
  return page.getByRole('button', { name: label });
}

async function expectReviewDate(page: Page, date: string): Promise<void> {
  await expect(page.getByText('Laatst gereviewd', { exact: true })).toBeVisible();
  await expect(page.getByText(date, { exact: true })).toBeVisible();
}

test('production output exposes installable metadata and a complete release cache', async ({ page }) => {
  const manifestResponse = await page.request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBe(true);

  const manifest = await manifestResponse.json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('/');
  expect(manifest.scope).toBe('/');
  expect(manifest.icons).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sizes: '192x192', type: 'image/png' }),
      expect.objectContaining({ sizes: '512x512', type: 'image/png' })
    ])
  );

  const iconResponse = await page.request.get('/icons/icon-192.png');
  expect(iconResponse.ok()).toBe(true);

  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);

  const release = await page.evaluate(async (cachePrefix) => {
    const keys = await caches.keys();
    const mixItCache = keys.find((key) => key.startsWith(cachePrefix));
    const cachedUrls = mixItCache ? await (await caches.open(mixItCache)).keys() : [];

    return {
      cacheNames: keys,
      cachedPaths: cachedUrls.map((request) => new URL(request.url).pathname)
    };
  }, RELEASE_CACHE_PREFIX);

  expect(release.cacheNames.filter((key) => key.startsWith(RELEASE_CACHE_PREFIX))).toHaveLength(1);
  const expectedReleasePaths = [
    '/',
    '/product/knauf-goldband-e-be',
    '/product/knauf-goldband-e-uk',
    '/product/knauf-mixem-light-be',
    '/product/knauf-mixem-basic-be',
    '/manifest.webmanifest',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
  ];
  expect(release.cachedPaths).toEqual(
    expect.arrayContaining(expectedReleasePaths)
  );
});

test('shared shell and Preferences pass an automated accessibility scan', async ({ page }) => {
  await page.goto('/');

  const accessibilityScan = await new AxeBuilder({ page })
    .include('nav[aria-label]')
    .analyze();

  expect(accessibilityScan.violations).toEqual([]);
});

test('stable catalog state passes an automated accessibility scan', async ({ page }) => {
  await page.goto('/');

  const accessibilityScan = await new AxeBuilder({ page })
    .include('section[aria-labelledby="catalog-title"]')
    .analyze();

  expect(accessibilityScan.violations).toEqual([]);
});

test('stable Market Variant powder state passes an automated accessibility scan', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  const accessibilityScan = await new AxeBuilder({ page })
    .include('section[aria-labelledby="calculator-title"]')
    .analyze();

  expect(accessibilityScan.violations).toEqual([]);
});

test('stable Market Variant guidance and Catalog Review state passes an automated accessibility scan', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();

  const accessibilityScan = await new AxeBuilder({ page })
    .include(
      'section[aria-labelledby="manufacturer-guidance-title"], section[aria-labelledby="traceability-title"]'
    )
    .analyze();

  expect(accessibilityScan.violations).toEqual([]);
});

test('stable Market Variant area state passes an automated accessibility scan', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();

  const accessibilityScan = await new AxeBuilder({ page })
    .include('section[aria-labelledby="calculator-title"]')
    .analyze();

  expect(accessibilityScan.violations).toEqual([]);
});

test('stable Market Variant width and height area state passes an automated accessibility scan', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('radio', { name: 'Breedte en hoogte' }).click();

  const accessibilityScan = await new AxeBuilder({ page })
    .include('section[aria-labelledby="calculator-title"]')
    .analyze();

  expect(accessibilityScan.violations).toEqual([]);
});

test('Market Variant reference design captures final desktop and mobile review snapshots', async (
  { page },
  testInfo
) => {
  if (!['chromium', 'mobile-chromium'].includes(testInfo.project.name)) test.skip();

  await page.goto('/product/knauf-goldband-e-be');
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await expect(page.getByTestId('calculation-result')).toContainText('8,0 L');

  // Attachments keep the approved reference review available across the supported
  // browser and operating-system matrix without committing platform-specific pixels.
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(`${testInfo.project.name}-market-variant-reference`, {
    body: screenshot,
    contentType: 'image/png'
  });
});

test('keyboard users can operate touch-sized Language and Market Preferences', async ({ page }) => {
  await page.goto('/');

  const language = preferenceTrigger(page, 'Taal');
  const market = preferenceTrigger(page, 'Markt');
  await expect
    .poll(() => language.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThanOrEqual(44);
  await expect
    .poll(() => market.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThanOrEqual(44);

  await language.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(preferenceTrigger(page, 'Language')).toContainText('EN');

  const englishMarket = preferenceTrigger(page, 'Market');
  await englishMarket.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(englishMarket).toContainText('United Kingdom');
});

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
  await expectReviewDate(page, '2025-02-03');
});

test('calculated estimates and manufacturer guidance expose packaging and Catalog Review traceability', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();

  await expect(page.getByTestId('calculation-result')).toContainText('Berekende schatting');
  await expect(page.getByText('Richtlijnen van de fabrikant', { exact: true })).toBeVisible();
  await expect(page.getByText('Verpakking', { exact: true })).toBeVisible();
  await expect(page.getByText('Zak van 25 kg', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'P131 - Knauf Goldband E' })).toBeVisible();
  await expect(page.getByText('Catalog Review', { exact: true })).toBeVisible();
  await expect(page.getByText('Voltooid', { exact: true })).toBeVisible();
  await expectReviewDate(page, '2025-02-03');
});

test('missing manufacturer facts retain a localized fallback', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();

  await expect(page.getByText('Droog- en uithardingstijd', { exact: true })).toBeVisible();
  await expect(page.getByText('Niet vermeld in het Source Document.', { exact: true })).toBeVisible();
});

test('powder calculator exposes one selected mode and preserves its result through a reload', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  const modes = page.getByRole('radio');
  const powderMode = modes.filter({ hasText: 'Poedermassa' });
  const areaMode = modes.filter({ hasText: 'Oppervlakte bedekken' });

  await expect(modes).toHaveCount(2);
  await expect(powderMode).toHaveAttribute('aria-checked', 'true');
  await expect(areaMode).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('[role="radio"][aria-checked="true"]')).toHaveCount(1);

  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await expect(page.getByTestId('calculation-result')).toContainText('8,0 L');

  await powderMode.click();
  await expect(powderMode).toHaveAttribute('aria-checked', 'true');
  await expect(areaMode).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByTestId('calculation-result')).toContainText('8,0 L');

  await page.reload();
  await expect(powderMode).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByLabel('Poedermassa')).toHaveValue('12,5');
  await expect(page.getByTestId('calculation-result')).toContainText('8,0 L');
});

test('mobile user can calculate powder and liquid for a direct area', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
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

  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  const directMode = page.getByRole('radio', { name: 'Rechtstreekse oppervlakte' });
  const dimensionsMode = page.getByRole('radio', { name: 'Breedte en hoogte' });
  await expect(directMode).toHaveAttribute('aria-checked', 'true');
  await dimensionsMode.click();
  await expect(dimensionsMode).toHaveAttribute('aria-checked', 'true');

  await page.getByRole('textbox', { name: 'Breedte', exact: true }).fill('4');
  await page.getByRole('textbox', { name: 'Hoogte', exact: true }).fill('250');
  await selectPreference(page, 'Eenheid van de hoogte', 'centimeter (cm)');
  await page.getByLabel('Laagdikte').fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  const result = page.getByTestId('area-calculation-result');
  await expect(result).toContainText('88 kg');
  await expect(result).toContainText('56,3 L');
  await expect(result).toContainText('10 m²');
  await expect(page.getByRole('textbox', { name: 'Breedte', exact: true })).toHaveValue('4');
  await expect(page.getByRole('textbox', { name: 'Hoogte', exact: true })).toHaveValue('250');
  await expect(page.getByRole('button', { name: 'Eenheid van de hoogte' })).toContainText(
    'centimeter (cm)'
  );

  await directMode.click();
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(result).toContainText('88 kg');
  await expect(result).toContainText('56,3 L');

  await dimensionsMode.click();
  await expect(page.getByRole('textbox', { name: 'Breedte', exact: true })).toHaveValue('4');
  await expect(page.getByRole('textbox', { name: 'Hoogte', exact: true })).toHaveValue('250');
  await expect(page.getByRole('button', { name: 'Eenheid van de hoogte' })).toContainText(
    'centimeter (cm)'
  );
  await expect(result).toContainText('88 kg');

  await page.getByRole('radio', { name: 'Poedermassa' }).click();
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  await directMode.click();
  await expect(page.getByRole('textbox', { name: 'Oppervlakte', exact: true })).toHaveValue('10');
  await dimensionsMode.click();
  await expect(page.getByRole('textbox', { name: 'Breedte', exact: true })).toHaveValue('4');
  await expect(page.getByRole('textbox', { name: 'Hoogte', exact: true })).toHaveValue('250');
});

test('direct area validation marks only the invalid field and removes a stale result', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  const area = page.getByRole('textbox', { name: 'Oppervlakte', exact: true });
  const thickness = page.getByLabel('Laagdikte');
  const wasteMargin = page.getByLabel('Verspillingsmarge');
  await area.fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');

  await area.fill('');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  await expect(page.getByRole('alert')).toHaveText('Voer een positieve oppervlakte in vierkante meter in.');
  await expect(page.getByTestId('area-calculation-result')).toHaveCount(0);
  await expect(area).toHaveAttribute('aria-invalid', 'true');
  await expect(thickness).not.toHaveAttribute('aria-invalid', 'true');
  await expect(wasteMargin).not.toHaveAttribute('aria-invalid', 'true');
});

test('incomplete dimensions are announced without showing a misleading result', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('radio', { name: 'Breedte en hoogte' }).click();
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

test('width and height validation identifies the incomplete field', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('radio', { name: 'Breedte en hoogte' }).click();
  const width = page.getByRole('textbox', { name: 'Breedte', exact: true });
  const height = page.getByRole('textbox', { name: 'Hoogte', exact: true });
  await height.fill('2,5');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  await expect(page.getByRole('alert')).toHaveText('Voer een positieve breedte en hoogte in.');
  await expect(width).toHaveAttribute('aria-invalid', 'true');
  await expect(width).toHaveAttribute('aria-describedby', 'dimensions-hint dimensions-error');
  await expect(height).not.toHaveAttribute('aria-invalid', 'true');
  await expect(height).toHaveAttribute('aria-describedby', 'dimensions-hint');
});

test('width and height unit Selects are keyboard-operable, touch-sized, and clear only their result', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  const directMode = page.getByRole('radio', { name: 'Rechtstreekse oppervlakte' });
  const dimensionsMode = page.getByRole('radio', { name: 'Breedte en hoogte' });
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');

  await dimensionsMode.click();
  await page.getByRole('textbox', { name: 'Breedte', exact: true }).fill('4');
  await page.getByRole('textbox', { name: 'Hoogte', exact: true }).fill('2,5');
  const widthUnit = page.getByRole('button', { name: 'Eenheid van de breedte' });
  const heightUnit = page.getByRole('button', { name: 'Eenheid van de hoogte' });
  await expect(widthUnit).toHaveText('meter (m)');
  await expect(heightUnit).toHaveText('meter (m)');
  await expect
    .poll(() => widthUnit.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThanOrEqual(44);
  await expect
    .poll(() => heightUnit.evaluate((element) => element.getBoundingClientRect().height))
    .toBeGreaterThanOrEqual(44);

  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');

  await widthUnit.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(widthUnit).toHaveText('centimeter (cm)');
  await expect(page.getByTestId('area-calculation-result')).toHaveCount(0);

  await directMode.click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');
});

test('editing shared area assumptions clears results for both entry modes', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  const result = page.getByTestId('area-calculation-result');
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  await page.getByRole('radio', { name: 'Breedte en hoogte' }).click();
  await page.getByRole('textbox', { name: 'Breedte', exact: true }).fill('4');
  await page.getByRole('textbox', { name: 'Hoogte', exact: true }).fill('2,5');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(result).toBeVisible();

  await page.getByLabel('Laagdikte').fill('15');
  await expect(result).toHaveCount(0);
  await page.getByRole('radio', { name: 'Rechtstreekse oppervlakte' }).click();
  await expect(result).toHaveCount(0);
});

test('calculator mode and area inputs persist through a reload', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');

  await page.reload();

  await expect(page.getByRole('radio', { name: 'Oppervlakte bedekken' })).toHaveAttribute(
    'aria-checked',
    'true'
  );
  await expect(page.getByRole('textbox', { name: 'Oppervlakte', exact: true })).toHaveValue('10');
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');
});

test('width and height inputs, units, and results persist through a reload', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('radio', { name: 'Breedte en hoogte' }).click();
  await page.getByRole('textbox', { name: 'Breedte', exact: true }).fill('4');
  await page.getByRole('textbox', { name: 'Hoogte', exact: true }).fill('250');
  await selectPreference(page, 'Eenheid van de hoogte', 'centimeter (cm)');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');

  await page.reload();

  await expect(page.getByRole('radio', { name: 'Breedte en hoogte' })).toHaveAttribute(
    'aria-checked',
    'true'
  );
  await expect(page.getByRole('textbox', { name: 'Breedte', exact: true })).toHaveValue('4');
  await expect(page.getByRole('textbox', { name: 'Hoogte', exact: true })).toHaveValue('250');
  await expect(page.getByRole('button', { name: 'Eenheid van de hoogte' })).toContainText(
    'centimeter (cm)'
  );
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');
});

test('dimension entry fits a touch-sized viewport without horizontal scrolling', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('radio', { name: 'Breedte en hoogte' }).click();

  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('keyboard users can submit the powder calculator without pointer interaction', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  const powderInput = page.getByLabel('Poedermassa');
  const calculate = page.getByRole('button', { name: /bereken vloeistof/i });
  await powderInput.fill('12,5');
  await powderInput.focus();
  await page.keyboard.press('Tab');
  await expect(calculate).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('calculation-result')).toContainText('8,0 L');
});

test('keyboard users can operate the area calculator without pointer interaction', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  const areaMode = page.getByRole('radio', { name: 'Oppervlakte bedekken' });
  await areaMode.focus();
  await page.keyboard.press('Enter');
  await expect(areaMode).toHaveAttribute('aria-checked', 'true');

  const dimensionsMode = page.getByRole('radio', { name: 'Breedte en hoogte' });
  await dimensionsMode.focus();
  await page.keyboard.press('Enter');
  await expect(dimensionsMode).toHaveAttribute('aria-checked', 'true');

  const width = page.getByRole('textbox', { name: 'Breedte', exact: true });
  const height = page.getByRole('textbox', { name: 'Hoogte', exact: true });
  await width.focus();
  await page.keyboard.type('4');
  await height.focus();
  await page.keyboard.type('250');

  const heightUnit = page.getByRole('button', { name: 'Eenheid van de hoogte' });
  await heightUnit.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(heightUnit).toContainText('centimeter (cm)');

  const calculate = page.getByRole('button', { name: /Bereken poeder en vloeistof/i });
  await calculate.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');
});

test('area mode warns when layer thickness is outside manufacturer guidance', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');

  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByLabel('Laagdikte').fill('30');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  await expect(page.getByRole('alert')).toContainText('buiten de richtlijnen van de fabrikant');
  await expect(
    page.getByRole('alert').getByText('Buiten de richtlijnen van de fabrikant', { exact: true })
  ).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('5–25 mm');
  await expect(page.getByTestId('area-calculation-result')).toContainText('264 kg');

  const accessibilityScan = await new AxeBuilder({ page })
    .include('[data-testid="area-calculation-result"]')
    .analyze();

  expect(accessibilityScan.violations).toEqual([]);
});

test('reviewed initial Market Variants expose calculator modes justified by their Source Documents', async ({ page }) => {
  await page.goto('/product/knauf-mixem-light-be');

  const areaMode = page.getByRole('radio', { name: 'Oppervlakte bedekken' });
  await expect(areaMode).not.toBeDisabled();
  await areaMode.click();
  await expect(page.getByLabel('Laagdikte')).toHaveValue('15');
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('1');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();

  const result = page.getByTestId('area-calculation-result');
  await expect(result).toContainText('20,13 kg');
  await expect(result).toContainText('5,4 L');
  await expect(page.getByText('Strooi een zak van 25 kg in ongeveer 6,7 liter')).toBeVisible();
  await expect(page.getByText('Niet vermeld in de technische fiche.')).toBeVisible();
  await expect(page.getByText('Minstens 1 dag per mm laagdikte vóór afwerking')).toBeVisible();
  await expectReviewDate(page, '2025-02-03');
});

test('MiXem Basic exposes reviewed powder and area calculations with source timings', async ({ page }) => {
  await page.goto('/product/knauf-mixem-basic-be');

  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await expect(page.getByTestId('calculation-result')).toContainText('2.350 ml');
  await expect(page.getByText('Voeg ongeveer 4,7 liter zuiver leidingwater')).toBeVisible();
  await expect(page.getByText('3 tot 4 minuten', { exact: true })).toBeVisible();
  await expect(page.getByText('Niet vermeld in de technische fiche.')).toBeVisible();
  await expect(page.getByText('Minstens 1 dag per mm pleisterdikte vóór afwerking')).toBeVisible();
  await expectReviewDate(page, '2025-02-04');

  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
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
  await expect(manufacturerFilter).toContainText('Alle fabrikanten');

  await search.fill('  knauf belgium  ');
  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(3);

  await search.fill('P252');
  await expect(page.getByRole('link', { name: /Knauf MiXem Basic/ })).toHaveCount(1);

  await search.fill('P291');
  await expect(page.getByText('Geen Market Variants gevonden.')).toBeVisible();

  await search.fill('P131');
  await manufacturerFilter.click();
  await page.getByRole('option', { name: 'Knauf Belgium', exact: true }).click();
  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(1);

  await manufacturerFilter.click();
  await page.getByRole('option', { name: 'Alle fabrikanten', exact: true }).click();
  await expect(manufacturerFilter).toContainText('Alle fabrikanten');
  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(1);
});

test('catalog controls are keyboard-operable and reset when Market changes', async ({ page }) => {
  await page.goto('/');

  const search = page.getByLabel('Zoek op naam, fabrikant, productcode of categorie');
  const manufacturerFilter = page.getByLabel('Filter op fabrikant');

  await search.fill('P252');
  await manufacturerFilter.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('option', { name: 'Alle fabrikanten', exact: true })).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(manufacturerFilter).toContainText('Knauf Belgium');

  await selectPreference(page, 'Markt', 'Verenigd Koninkrijk');

  await expect(search).toHaveValue('');
  await expect(manufacturerFilter).toContainText('Alle fabrikanten');
  await expect(page.getByRole('link', { name: /open calculator/i })).toHaveCount(1);
});

test('catalog fits a touch-sized viewport without horizontal scrolling', async ({ page }) => {
  await page.goto('/');

  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)
    )
    .toBe(true);
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

  await selectPreference(page, 'Taal', 'EN');
  const market = preferenceTrigger(page, 'Market');
  await expect(market).toContainText('Belgium');
  await expect(page.getByRole('link', { name: /Knauf Goldband E/ })).toBeVisible();

  await selectPreference(page, 'Market', 'United Kingdom');
  await expect(market).toContainText('United Kingdom');
  await expect(
    page.getByRole('region', { name: 'Catalog' }).getByText('United Kingdom', { exact: true })
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /Knauf Multi Finish/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Knauf Goldband E/ })).toHaveCount(0);

  await page.getByRole('link', { name: /Knauf Multi Finish/ }).click();
  await expect(page.getByRole('heading', { name: 'Knauf Multi Finish', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'P127 - Knauf Multi Finish' })).toBeVisible();

  await selectPreference(page, 'Language', 'NL');
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await expect(page.getByText('Voeg een zak van 25 kg toe aan ongeveer 11,5 liter')).toBeVisible();
  await expect(preferenceTrigger(page, 'Markt')).toContainText('Verenigd Koninkrijk');
});

test('Market and Language preferences persist across reloads', async ({ page }) => {
  await page.goto('/');

  await selectPreference(page, 'Markt', 'Verenigd Koninkrijk');
  await selectPreference(page, 'Taal', 'EN');
  await page.reload();

  await expect(preferenceTrigger(page, 'Language')).toContainText('EN');
  await expect(preferenceTrigger(page, 'Market')).toContainText('United Kingdom');
  await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Knauf Multi Finish/ })).toBeVisible();
});

test('saved Market preference resolves direct calculator navigation to its Market Variant', async ({ page }) => {
  await page.goto('/');
  await selectPreference(page, 'Markt', 'Verenigd Koninkrijk');
  await expect(preferenceTrigger(page, 'Markt')).toContainText('Verenigd Koninkrijk');

  await page.goto('/product/knauf-goldband-e-be');

  await expect(page).toHaveURL(/\/product\/knauf-goldband-e-uk$/);
  await expect(page.getByRole('heading', { name: 'Knauf Multi Finish', exact: true })).toBeVisible();
});

test('changing Market clears a previously calculated area result', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toBeVisible();

  await selectPreference(page, 'Markt', 'Verenigd Koninkrijk');
  await expect(page).toHaveURL(/\/product\/knauf-goldband-e-uk$/);
  await expect(page.getByTestId('area-calculation-result')).toHaveCount(0);
});

test('UK Market accepts comma and point input and formats liquid thresholds', async ({ page }) => {
  await page.goto('/product/knauf-goldband-e-uk');
  await selectPreference(page, 'Taal', 'EN');
  await expect(preferenceTrigger(page, 'Language')).toContainText('EN');

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

  await page.getByRole('radio', { name: 'Area to cover' }).click();
  await page.getByRole('textbox', { name: 'Area', exact: true }).fill('10,0');
  await page.getByRole('button', { name: /calculate powder and liquid/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');
  await expect(page.getByTestId('area-calculation-result')).toContainText('40.5 L');
  await page.getByRole('textbox', { name: 'Area', exact: true }).fill('10.0');
  await page.getByRole('button', { name: /calculate powder and liquid/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('40.5 L');
});

test('installed catalog and calculator work offline', async ({ page, context }) => {
  await page.goto('/product/knauf-goldband-e-be');
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await expect(page.getByTestId('calculation-result')).toContainText('8,0 L');
  await page.evaluate(async () => {
    if ('serviceWorker' in navigator) await navigator.serviceWorker.ready;
  });

  const webkitCatalogPage =
    test.info().project.name === 'webkit' ? await context.newPage() : null;
  if (webkitCatalogPage) {
    await webkitCatalogPage.goto('/');
    await expect(webkitCatalogPage.getByRole('heading', { name: 'Catalogus' })).toBeVisible();
  }

  await context.setOffline(true);

  if (test.info().project.name === 'webkit') {
    // WebKit reports an internal navigation error before its service worker can
    // handle page.reload(), so cover the no-network product journey in-place.
    await webkitCatalogPage!
      .getByLabel('Zoek op naam, fabrikant, productcode of categorie')
      .fill('P252');
    await expect(webkitCatalogPage!.getByRole('link', { name: /Knauf MiXem Basic/ })).toBeVisible();
    await page.getByLabel('Poedermassa').fill('12,5');
    await page.getByRole('button', { name: /bereken vloeistof/i }).click();
    await expect(page.getByTestId('calculation-result')).toContainText('8,0 L');
    await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
    await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
    await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
    await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');
    await expect(page.getByTestId('area-calculation-result')).toContainText('56,3 L');
    await webkitCatalogPage!.close();
    return;
  }

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Knauf Goldband E', exact: true })).toBeVisible();
  await expect(page.getByLabel('Poedermassa')).toHaveValue('12,5');
  await page.getByLabel('Poedermassa').fill('12,5');
  await page.getByRole('button', { name: /bereken vloeistof/i }).click();
  await expect(page.getByTestId('calculation-result')).toContainText('8,0 L');

  await page.goto('/');
  await page.getByLabel('Zoek op naam, fabrikant, productcode of categorie').fill('P252');
  await expect(page.getByRole('link', { name: /Knauf MiXem Basic/ })).toBeVisible();

  await page.goto('/product/knauf-goldband-e-be');
  await page.getByRole('radio', { name: 'Oppervlakte bedekken' }).click();
  await page.getByRole('textbox', { name: 'Oppervlakte', exact: true }).fill('10');
  await page.getByRole('button', { name: /Bereken poeder en vloeistof/i }).click();
  await expect(page.getByTestId('area-calculation-result')).toContainText('88 kg');
  await expect(page.getByTestId('area-calculation-result')).toContainText('56,3 L');
});

test.describe('browser Market defaults', () => {
  test.use({ locale: 'en-GB' });

  test('uses the browser region when no Market preference exists', async ({ page }) => {
    await page.goto('/');

    await expect(preferenceTrigger(page, 'Markt')).toContainText('Verenigd Koninkrijk');
    await expect(page.getByRole('link', { name: /Knauf Multi Finish/ })).toBeVisible();

    await page.goto('/product/knauf-goldband-e-be');
    await expect(page).toHaveURL(/\/product\/knauf-goldband-e-uk$/);
  });
});
