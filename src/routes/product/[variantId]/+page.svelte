<script lang="ts">
  import type { PageProps } from './$types';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  import { findMarketVariant, supportedMarkets, type Language, type Market } from '$lib/catalog/catalog';
  import { publishedCatalog } from '$lib/catalog/published';
  import {
    readCalculatorState,
    saveCalculatorState,
    type AreaInputMode,
    type CalculatorMode
  } from '$lib/calculator-state';
  import AppTopbar from '$lib/components/AppTopbar.svelte';
  import {
    calculateAreaRequirements,
    calculateRequiredLiquid
  } from '$lib/calculation/calculation';
  import type { DimensionUnit } from '$lib/calculation/units';
  import {
    calculateAreaSquareMetresFromDimensions,
    formatEnteredPowderMass,
    formatLiquidQuantity,
    formatMetricNumber,
    formatPowderQuantity,
    formatQuantityExample,
    parseMetricInput,
    parseNonNegativeMetricInput
  } from '$lib/presentation/number-formatting';
  import { getMessages } from '$lib/i18n/messages';
  import {
    hasSupportedMarketRegion,
    marketFromBrowserLocale,
    readLanguage,
    readStoredMarket,
    selectLanguage,
    selectMarket
  } from '$lib/preferences';

  let { data }: PageProps = $props();
  const variant = $derived(data.variant);

  type AreaInputError = 'area' | 'dimensions' | 'width' | 'height' | 'thickness' | 'wasteMargin';
  type AreaInputValues = {
    areaSquareMetres: number;
    thicknessMm: number;
    wasteMargin: number;
  };

  function readInitialCalculatorState(): ReturnType<typeof readCalculatorState> {
    return readCalculatorState(data.variant.id);
  }

  const savedCalculatorState = readInitialCalculatorState();
  const restoredPowderInput = savedCalculatorState?.submittedPowderInput ?? '';
  const restoredPowderMass = parseMetricInput(restoredPowderInput);

  onMount(() => {
    const storedMarket = readStoredMarket();
    const browserMarket = hasSupportedMarketRegion(navigator.language)
      ? marketFromBrowserLocale(navigator.language)
      : null;
    const preferredMarket = storedMarket ?? browserMarket;
    if (!preferredMarket || preferredMarket === variant.market) return;

    const preferredVariant = findMarketVariant(
      publishedCatalog,
      variant.productFamilyId,
      preferredMarket
    );

    void goto(preferredVariant ? `/product/${preferredVariant.id}` : '/', { replaceState: true });
  });

  let language = $state<Language>(readLanguage());
  const market = $derived<Market>(variant.market);
  let calculatorMode = $state<CalculatorMode>(savedCalculatorState?.calculatorMode ?? 'powder');
  let areaInputMode = $state<AreaInputMode>(savedCalculatorState?.areaInputMode ?? 'direct');
  let powderInput = $state(savedCalculatorState?.powderInput ?? '');
  let validationMessage = $state('');
  let enteredPowderMass = $state<number | null>(restoredPowderMass);
  let submittedPowderInput = $state(restoredPowderMass === null ? '' : restoredPowderInput);
  let areaInput = $state(savedCalculatorState?.areaInput ?? '');
  let widthInput = $state(savedCalculatorState?.widthInput ?? '');
  let widthUnit = $state<DimensionUnit>(savedCalculatorState?.widthUnit ?? 'm');
  let heightInput = $state(savedCalculatorState?.heightInput ?? '');
  let heightUnit = $state<DimensionUnit>(savedCalculatorState?.heightUnit ?? 'm');
  let thicknessInput = $state<string | undefined>(
    savedCalculatorState?.thicknessInput || undefined
  );
  let wasteMarginInput = $state(savedCalculatorState?.wasteMarginInput ?? '10');
  let areaValidationMessage = $state('');
  let areaValidationError = $state<AreaInputError | null>(null);
  let directAreaCalculation = $state<ReturnType<typeof calculateAreaRequirements> | null>(null);
  let dimensionsAreaCalculation = $state<ReturnType<typeof calculateAreaRequirements> | null>(null);

  const copy = $derived(getMessages(language));
  const translation = $derived(variant.translations[language]);
  const liquid = $derived(
    enteredPowderMass === null ? null : calculateRequiredLiquid(enteredPowderMass, variant)
  );
  const areaAvailable = $derived(variant.referenceConsumption?.referenceThicknessMm !== undefined);
  const displayedThickness = $derived(
    thicknessInput ?? variant.referenceConsumption?.referenceThicknessMm?.toString() ?? ''
  );
  const areaCalculation = $derived(
    areaInputMode === 'direct' ? directAreaCalculation : dimensionsAreaCalculation
  );
  const showGuidance = $derived(
    (calculatorMode === 'powder' && liquid !== null) ||
      (calculatorMode === 'area' && areaCalculation !== null)
  );
  const enteredPowderDisplay = $derived(
    submittedPowderInput ? formatEnteredPowderMass(submittedPowderInput, market) : ''
  );

  $effect(() => {
    saveCalculatorState(data.variant.id, {
      calculatorMode,
      areaInputMode,
      powderInput,
      submittedPowderInput,
      areaInput,
      widthInput,
      widthUnit,
      heightInput,
      heightUnit,
      thicknessInput: thicknessInput ?? '',
      wasteMarginInput,
      directAreaSubmitted: directAreaCalculation !== null,
      dimensionsAreaSubmitted: dimensionsAreaCalculation !== null
    });
  });

  function changeLanguage(event: Event): void {
    language = selectLanguage(event);
  }

  function changeMarket(event: Event): void {
    const selectedMarket = selectMarket(event);
    clearCalculatorStateForMarketChange();
    const nextVariant = findMarketVariant(publishedCatalog, variant.productFamilyId, selectedMarket);

    if (nextVariant) {
      void goto(`/product/${nextVariant.id}`);
    } else {
      void goto('/');
    }
  }

  function selectCalculatorMode(mode: 'powder' | 'area'): void {
    calculatorMode = mode;
  }

  function selectAreaInputMode(mode: 'direct' | 'dimensions'): void {
    areaInputMode = mode;
    areaValidationMessage = '';
    areaValidationError = null;
  }

  function changeThickness(event: Event): void {
    thicknessInput = (event.currentTarget as HTMLInputElement).value;
    clearAllAreaState();
  }

  function clearActiveAreaState(): void {
    clearActiveAreaCalculation();
    areaValidationMessage = '';
    areaValidationError = null;
  }

  function clearAllAreaState(): void {
    directAreaCalculation = null;
    dimensionsAreaCalculation = null;
    areaValidationMessage = '';
    areaValidationError = null;
  }

  function clearCalculatorStateForMarketChange(): void {
    powderInput = '';
    validationMessage = '';
    enteredPowderMass = null;
    submittedPowderInput = '';
    clearAllAreaState();
  }

  function clearActiveAreaCalculation(): void {
    if (areaInputMode === 'direct') {
      directAreaCalculation = null;
    } else {
      dimensionsAreaCalculation = null;
    }
  }

  function calculate(event: SubmitEvent): void {
    event.preventDefault();
    const parsedMass = parseMetricInput(powderInput);

    if (parsedMass === null) {
      enteredPowderMass = null;
      submittedPowderInput = '';
      validationMessage = copy.invalidPowder;
      return;
    }

    validationMessage = '';
    enteredPowderMass = parsedMass;
    submittedPowderInput = powderInput;
  }

  function parseAreaInputValues(mode: AreaInputMode):
    | { values: AreaInputValues }
    | { error: AreaInputError } {
    const parsedThickness = parseMetricInput(displayedThickness);
    if (parsedThickness === null) return { error: 'thickness' };

    const parsedWasteMargin = parseNonNegativeMetricInput(wasteMarginInput);
    if (parsedWasteMargin === null) return { error: 'wasteMargin' };

    if (mode === 'direct') {
      const parsedArea = parseMetricInput(areaInput);
      if (parsedArea === null) return { error: 'area' };

      return {
        values: {
          areaSquareMetres: parsedArea,
          thicknessMm: parsedThickness,
          wasteMargin: parsedWasteMargin / 100
        }
      };
    }

    const parsedWidth = parseMetricInput(widthInput);
    const parsedHeight = parseMetricInput(heightInput);
    if (parsedWidth === null || parsedHeight === null) {
      if (parsedWidth === null && parsedHeight === null) return { error: 'dimensions' };
      return { error: parsedWidth === null ? 'width' : 'height' };
    }

    return {
      values: {
        areaSquareMetres: calculateAreaSquareMetresFromDimensions({
          width: parsedWidth,
          widthUnit,
          height: parsedHeight,
          heightUnit
        }),
        thicknessMm: parsedThickness,
        wasteMargin: parsedWasteMargin / 100
      }
    };
  }

  function calculateAreaForMode(mode: AreaInputMode): ReturnType<typeof calculateAreaRequirements> | null {
    const referenceConsumption = variant.referenceConsumption;
    if (referenceConsumption?.referenceThicknessMm === undefined) return null;

    const parsed = parseAreaInputValues(mode);
    if ('error' in parsed) return null;

    return calculateAreaRequirements({
      ...parsed.values,
      mixingRatio: variant.mixingRatio,
      referenceConsumption: {
        powderKgPerSquareMetre: referenceConsumption.powderKgPerSquareMetre,
        referenceThicknessMm: referenceConsumption.referenceThicknessMm
      },
      supportedThicknessRange: variant.supportedThicknessRange
    });
  }

  function calculateArea(event: SubmitEvent): void {
    event.preventDefault();
    const parsed = parseAreaInputValues(areaInputMode);
    if ('error' in parsed) {
      clearActiveAreaCalculation();
      areaValidationError = parsed.error;
      areaValidationMessage = {
        area: copy.invalidArea,
        dimensions: copy.invalidDimensions,
        width: copy.invalidDimensions,
        height: copy.invalidDimensions,
        thickness: copy.invalidThickness,
        wasteMargin: copy.invalidWasteMargin
      }[parsed.error];
      return;
    }

    areaValidationMessage = '';
    areaValidationError = null;
    const calculation = calculateAreaForMode(areaInputMode);
    if (!calculation) return;

    if (areaInputMode === 'direct') {
      directAreaCalculation = calculation;
    } else {
      dimensionsAreaCalculation = calculation;
    }
  }

  if (savedCalculatorState?.directAreaSubmitted) {
    directAreaCalculation = calculateAreaForMode('direct');
  }

  if (savedCalculatorState?.dimensionsAreaSubmitted) {
    dimensionsAreaCalculation = calculateAreaForMode('dimensions');
  }
</script>

<svelte:head>
  <title>{translation.name} — Mix-it</title>
  <meta name="description" content={copy.productDescription(translation.name)} />
</svelte:head>

<main class="container">
  <AppTopbar
    {language}
    {market}
    markets={supportedMarkets}
    {copy}
    onLanguageChange={changeLanguage}
    onMarketChange={changeMarket}
  />

  <p><a href="/">← {copy.backToCatalog}</a></p>

  <header>
    <p>{translation.category} · {variant.market} · {variant.productCode}</p>
    <h1 id="product-title">{translation.name}</h1>
    <p>{copy.productFamily}: {variant.productFamilyId}</p>
  </header>

  <article aria-labelledby="calculator-title">
    <header>
      <p>{copy.calculatorEyebrow}</p>
      <h2 id="calculator-title">{copy.calculatorTitle}</h2>
      <p>{copy.calculatorIntro}</p>
      <small>{copy.quantityFormatHint(formatQuantityExample(market))}</small>
    </header>

    <div role="group" aria-label={copy.calculatorModeLabel}>
      <button
        type="button"
        aria-pressed={calculatorMode === 'powder'}
        onclick={() => selectCalculatorMode('powder')}
      >{copy.powderMode}</button>
      <button
        type="button"
        aria-pressed={calculatorMode === 'area'}
        disabled={!areaAvailable}
        onclick={() => selectCalculatorMode('area')}
      >{copy.areaMode}</button>
    </div>

    {#if !areaAvailable}
      <p role="status">{copy.areaUnavailable}</p>
    {/if}

    {#if calculatorMode === 'powder'}
      <form onsubmit={calculate} aria-label={copy.calculatorTitle} novalidate>
        <label for="powder-mass">{copy.powderLabel} <span aria-hidden="true">(kg)</span></label>
        <input
          id="powder-mass"
          bind:value={powderInput}
          aria-describedby="powder-hint powder-error"
          aria-invalid={validationMessage ? 'true' : 'false'}
          inputmode="decimal"
          autocomplete="off"
          type="text"
          placeholder={language === 'nl' ? '12,5' : '12.5'}
        />
        <small id="powder-hint">{copy.powderHint}</small>
        {#if validationMessage}
          <p id="powder-error" role="alert">{validationMessage}</p>
        {/if}
        <button type="submit">{copy.calculate} <span aria-hidden="true">→</span></button>
      </form>
    {:else if areaAvailable}
      <form onsubmit={calculateArea} aria-label={copy.areaMode} novalidate>
        <div role="group" aria-label={copy.areaInputModeLabel}>
          <button
            type="button"
            aria-pressed={areaInputMode === 'direct'}
            onclick={() => selectAreaInputMode('direct')}
          >{copy.directAreaMode}</button>
          <button
            type="button"
            aria-pressed={areaInputMode === 'dimensions'}
            onclick={() => selectAreaInputMode('dimensions')}
          >{copy.dimensionsMode}</button>
        </div>

        {#if areaInputMode === 'direct'}
          <label for="area">{copy.areaLabel} <span aria-hidden="true">(m²)</span></label>
          <input
            id="area"
            bind:value={areaInput}
            oninput={clearActiveAreaState}
            aria-describedby="area-hint area-error"
            aria-invalid={areaValidationError === 'area' ? 'true' : 'false'}
            inputmode="decimal"
            autocomplete="off"
            type="text"
            placeholder={language === 'nl' ? '2,5' : '2.5'}
          />
          <small id="area-hint">{copy.areaHint}</small>
        {:else}
          <div class="grid">
            <div>
              <label for="width">{copy.widthLabel}</label>
              <div role="group" aria-label={copy.widthUnitLabel}>
                <input
                  id="width"
                  bind:value={widthInput}
                  oninput={clearActiveAreaState}
                  aria-describedby="dimensions-hint area-error"
                  aria-invalid={
                    areaValidationError === 'width' || areaValidationError === 'dimensions'
                      ? 'true'
                      : 'false'
                  }
                  inputmode="decimal"
                  autocomplete="off"
                  type="text"
                  placeholder={language === 'nl' ? '2,5' : '2.5'}
                />
                <select
                  id="width-unit"
                  bind:value={widthUnit}
                  onchange={clearActiveAreaState}
                  aria-label={copy.widthUnitLabel}
                >
                  <option value="m">{copy.metres}</option>
                  <option value="cm">{copy.centimetres}</option>
                </select>
              </div>
            </div>

            <div>
              <label for="height">{copy.heightLabel}</label>
              <div role="group" aria-label={copy.heightUnitLabel}>
                <input
                  id="height"
                  bind:value={heightInput}
                  oninput={clearActiveAreaState}
                  aria-describedby="dimensions-hint area-error"
                  aria-invalid={
                    areaValidationError === 'height' || areaValidationError === 'dimensions'
                      ? 'true'
                      : 'false'
                  }
                  inputmode="decimal"
                  autocomplete="off"
                  type="text"
                  placeholder={language === 'nl' ? '2,5' : '2.5'}
                />
                <select
                  id="height-unit"
                  bind:value={heightUnit}
                  onchange={clearActiveAreaState}
                  aria-label={copy.heightUnitLabel}
                >
                  <option value="m">{copy.metres}</option>
                  <option value="cm">{copy.centimetres}</option>
                </select>
              </div>
            </div>
          </div>
          <small id="dimensions-hint">{copy.dimensionsHint}</small>
        {/if}

        <label for="thickness">{copy.thicknessLabel} <span aria-hidden="true">(mm)</span></label>
        <input
          id="thickness"
          value={displayedThickness}
          oninput={changeThickness}
          aria-describedby="thickness-hint area-error"
          aria-invalid={areaValidationError === 'thickness' ? 'true' : 'false'}
          inputmode="decimal"
          autocomplete="off"
          type="text"
        />
        <small id="thickness-hint">{copy.thicknessHint}</small>

        <label for="waste-margin">{copy.wasteMarginLabel} <span aria-hidden="true">(%)</span></label>
        <input
          id="waste-margin"
          bind:value={wasteMarginInput}
          oninput={clearAllAreaState}
          aria-describedby="waste-margin-hint area-error"
          aria-invalid={areaValidationError === 'wasteMargin' ? 'true' : 'false'}
          inputmode="decimal"
          autocomplete="off"
          type="text"
        />
        <small id="waste-margin-hint">{copy.wasteMarginHint}</small>
        {#if areaValidationMessage}
          <p id="area-error" role="alert">{areaValidationMessage}</p>
        {/if}
        <button type="submit">{copy.calculateArea} <span aria-hidden="true">→</span></button>
      </form>
    {/if}

    {#if calculatorMode === 'powder' && liquid !== null}
      <article aria-live="polite" data-testid="calculation-result">
        <header><p>{copy.resultTitle}</p></header>
        <p><strong>{formatLiquidQuantity(liquid, market)}</strong></p>
        <p>{copy.enteredPowder}: <strong>{enteredPowderDisplay} kg</strong></p>
      </article>
    {:else if calculatorMode === 'area' && areaCalculation !== null}
      <article aria-labelledby="area-result-title" aria-live="polite" data-testid="area-calculation-result">
        <header><h3 id="area-result-title">{copy.areaResultTitle}</h3></header>
        <dl>
          <div>
            <dt>{copy.requiredPowder}</dt>
            <dd><strong>{formatPowderQuantity(areaCalculation.requiredPowderKg, market)}</strong></dd>
          </div>
          <div>
            <dt>{copy.requiredLiquid}</dt>
            <dd><strong>{formatLiquidQuantity(areaCalculation.requiredLiquidLitres, market)}</strong></dd>
          </div>
          <div>
            <dt>{copy.areaAssumptionArea}</dt>
            <dd>{formatMetricNumber(areaCalculation.assumptions.areaSquareMetres, market)} m²</dd>
          </div>
          <div>
            <dt>{copy.areaAssumptionThickness}</dt>
            <dd>{formatMetricNumber(areaCalculation.assumptions.thicknessMm, market)} mm</dd>
          </div>
          <div>
            <dt>{copy.wasteMarginLabel}</dt>
            <dd>
              {copy.areaAssumptionWasteMargin(
                formatMetricNumber(areaCalculation.assumptions.wasteMargin * 100, market)
              )}
            </dd>
          </div>
        </dl>
        {#if areaCalculation.outsideSupportedThicknessRange}
          <p role="alert">
            {copy.outsideGuidance(
              formatMetricNumber(variant.supportedThicknessRange.minMm, market),
              formatMetricNumber(variant.supportedThicknessRange.maxMm, market)
            )}
          </p>
        {/if}
      </article>
    {/if}

    {#if showGuidance}
      <section aria-labelledby="guidance-title">
        <header>
          <h3 id="guidance-title">{copy.mixingInstructions}</h3>
          <p>{translation.mixingInstructions}</p>
        </header>
        <dl>
          <div>
            <dt>{copy.mixingTime}</dt>
            <dd>{translation.mixingTime}</dd>
          </div>
          {#if translation.workingTime}
            <div>
              <dt>{copy.workingTime}</dt>
              <dd>{translation.workingTime}</dd>
            </div>
          {/if}
          {#if translation.dryingTime}
            <div>
              <dt>{copy.dryingTime}</dt>
              <dd>{translation.dryingTime}</dd>
            </div>
          {/if}
        </dl>
      </section>

      <aside>
        <h3>{copy.disclaimer}</h3>
        <p>{translation.disclaimer}</p>
      </aside>
    {/if}
  </article>

  <section aria-labelledby="traceability-title">
    <header>
      <p>{copy.sourceDocument}</p>
      <h2 id="traceability-title">{variant.sourceDocument.title}</h2>
      <p>{variant.sourceDocument.fileName} · {variant.sourceDocument.version}</p>
    </header>
    <aside>
      <p>{copy.reviewNote}</p>
      <strong>{copy.lastReviewed}: {variant.catalogReview.lastReviewed}</strong>
    </aside>
  </section>
</main>
