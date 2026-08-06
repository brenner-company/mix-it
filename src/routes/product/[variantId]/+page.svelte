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
  }

  function changeThickness(event: Event): void {
    thicknessInput = (event.currentTarget as HTMLInputElement).value;
    clearAllAreaState();
  }

  function clearActiveAreaState(): void {
    clearActiveAreaCalculation();
    areaValidationMessage = '';
  }

  function clearAllAreaState(): void {
    directAreaCalculation = null;
    dimensionsAreaCalculation = null;
    areaValidationMessage = '';
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

  type AreaInputError = 'area' | 'dimensions' | 'thickness' | 'wasteMargin';
  type AreaInputValues = {
    areaSquareMetres: number;
    thicknessMm: number;
    wasteMargin: number;
  };

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
    if (parsedWidth === null || parsedHeight === null) return { error: 'dimensions' };

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
      areaValidationMessage = {
        area: copy.invalidArea,
        dimensions: copy.invalidDimensions,
        thickness: copy.invalidThickness,
        wasteMargin: copy.invalidWasteMargin
      }[parsed.error];
      return;
    }

    areaValidationMessage = '';
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
      <p class="area-unavailable" role="status">{copy.areaUnavailable}</p>
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
      <form onsubmit={calculateArea} novalidate>
        <div class="mode-selector area-input-mode-selector" role="group" aria-label={copy.areaInputModeLabel}>
          <button
            type="button"
            class={areaInputMode === 'direct' ? 'mode-button mode-active' : 'mode-button'}
            aria-pressed={areaInputMode === 'direct'}
            onclick={() => selectAreaInputMode('direct')}
          >{copy.directAreaMode}</button>
          <button
            type="button"
            class={areaInputMode === 'dimensions' ? 'mode-button mode-active' : 'mode-button'}
            aria-pressed={areaInputMode === 'dimensions'}
            onclick={() => selectAreaInputMode('dimensions')}
          >{copy.dimensionsMode}</button>
        </div>

        {#if areaInputMode === 'direct'}
          <label for="area" class="field-label">{copy.areaLabel}</label>
          <div class="input-with-unit">
            <input
              id="area"
              bind:value={areaInput}
              oninput={clearActiveAreaState}
              aria-describedby="area-hint area-error"
              aria-invalid={areaValidationMessage ? 'true' : 'false'}
              inputmode="decimal"
              autocomplete="off"
              type="text"
              placeholder={language === 'nl' ? '2,5' : '2.5'}
            />
            <span aria-hidden="true">m²</span>
          </div>
          <p id="area-hint" class="field-hint">{copy.areaHint}</p>
        {:else}
          <div class="dimensions-grid">
            <div class="dimension-field">
              <label for="width" class="field-label">{copy.widthLabel}</label>
              <div class="dimension-input-row">
                <input
                  id="width"
                  bind:value={widthInput}
                  oninput={clearActiveAreaState}
                  aria-describedby="dimensions-hint area-error"
                  aria-invalid={areaValidationMessage ? 'true' : 'false'}
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

            <div class="dimension-field">
              <label for="height" class="field-label">{copy.heightLabel}</label>
              <div class="dimension-input-row">
                <input
                  id="height"
                  bind:value={heightInput}
                  oninput={clearActiveAreaState}
                  aria-describedby="dimensions-hint area-error"
                  aria-invalid={areaValidationMessage ? 'true' : 'false'}
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
          <p id="dimensions-hint" class="field-hint">{copy.dimensionsHint}</p>
        {/if}

        <label for="thickness" class="field-label">{copy.thicknessLabel}</label>
        <div class="input-with-unit">
          <input
            id="thickness"
            value={displayedThickness}
            oninput={changeThickness}
            aria-describedby="thickness-hint area-error"
            aria-invalid={areaValidationMessage ? 'true' : 'false'}
            inputmode="decimal"
            autocomplete="off"
            type="text"
          />
          <span aria-hidden="true">mm</span>
        </div>
        <p id="thickness-hint" class="field-hint">{copy.thicknessHint}</p>

        <label for="waste-margin" class="field-label">{copy.wasteMarginLabel}</label>
        <div class="input-with-unit">
          <input
            id="waste-margin"
            bind:value={wasteMarginInput}
            oninput={clearAllAreaState}
            aria-describedby="waste-margin-hint area-error"
            aria-invalid={areaValidationMessage ? 'true' : 'false'}
            inputmode="decimal"
            autocomplete="off"
            type="text"
          />
          <span aria-hidden="true">%</span>
        </div>
        <p id="waste-margin-hint" class="field-hint">{copy.wasteMarginHint}</p>
        {#if areaValidationMessage}
          <p id="area-error" class="error-message" role="alert">{areaValidationMessage}</p>
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
      <div class="calculation-result area-calculation-result" aria-live="polite" data-testid="area-calculation-result">
        <p class="result-label">{copy.areaResultTitle}</p>
        <div class="area-quantities">
          <div>
            <p class="quantity-label">{copy.requiredPowder}</p>
            <p class="powder-value">{formatPowderQuantity(areaCalculation.requiredPowderKg, market)}</p>
          </div>
          <div>
            <p class="quantity-label">{copy.requiredLiquid}</p>
            <p class="liquid-value">{formatLiquidQuantity(areaCalculation.requiredLiquidLitres, market)}</p>
          </div>
        </div>
        <dl class="assumptions-list">
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
          <p class="range-warning" role="alert">
            {copy.outsideGuidance(
              formatMetricNumber(variant.supportedThicknessRange.minMm, market),
              formatMetricNumber(variant.supportedThicknessRange.maxMm, market)
            )}
          </p>
        {/if}
      </div>
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

<style>
  .mode-selector {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.35rem;
    padding: 0.35rem;
    border-radius: 0.9rem;
    background: #f5f0e8;
  }

  .mode-button {
    min-height: 2.8rem;
    margin: 0;
    color: var(--pico-color);
    background: transparent;
  }

  .mode-button:hover,
  .mode-button.mode-active {
    color: var(--pico-color);
    background: var(--pico-card-background-color);
  }

  .mode-button.mode-active {
    box-shadow: 0 0.2rem 0.65rem rgba(16, 42, 44, 0.1);
  }

  .mode-button:disabled {
    color: var(--pico-muted-color);
    background: transparent;
    cursor: not-allowed;
    opacity: 0.65;
  }

  .area-input-mode-selector {
    margin-bottom: 0.35rem;
  }

  .area-unavailable {
    margin: 0;
    padding: 0.85rem 1rem;
    border-left: 4px solid var(--pico-muted-border-color);
    color: var(--pico-muted-color);
    font-size: 0.86rem;
    line-height: 1.5;
  }

  .dimensions-grid {
    display: grid;
    gap: 1rem;
  }

  .dimension-input-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(6.5rem, 8rem);
    gap: 0.55rem;
  }

  .dimension-input-row select {
    min-width: 0;
    padding-right: 0.55rem;
    padding-left: 0.55rem;
  }

  .input-with-unit {
    position: relative;
  }

  .input-with-unit input {
    padding-right: 3.5rem;
    font-size: 1.3rem;
    font-weight: 700;
  }

  .input-with-unit span {
    position: absolute;
    top: 50%;
    right: 1rem;
    color: var(--pico-muted-color);
    font-weight: 700;
    transform: translateY(-50%);
  }

  .error-message {
    margin: 0.65rem 0 0;
    color: #a32724;
    font-size: 0.87rem;
    font-weight: 700;
  }

  .calculation-result {
    padding: 1.35rem;
    border-radius: 1.15rem;
    background: var(--pico-card-sectioning-background-color);
  }

  .area-quantities {
    display: grid;
    gap: 1rem;
  }

  .area-quantities > div {
    padding-top: 0.75rem;
    border-top: 1px solid rgba(16, 42, 44, 0.14);
  }

  .quantity-label {
    margin-bottom: 0.25rem;
    color: var(--pico-muted-color);
    font-size: 0.82rem;
    font-weight: 800;
  }

  .powder-value {
    margin: 0;
    color: var(--pico-color);
    font-size: clamp(2.35rem, 10vw, 4rem);
    font-weight: 850;
    letter-spacing: -0.08em;
    line-height: 0.95;
  }

  .area-quantities .liquid-value {
    margin-bottom: 0;
  }

  .assumptions-list {
    display: grid;
    gap: 0.55rem;
    margin: 1.25rem 0 0;
  }

  .assumptions-list div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 0.55rem;
    border-top: 1px solid rgba(16, 42, 44, 0.1);
  }

  .assumptions-list dt,
  .assumptions-list dd {
    margin: 0;
  }

  .range-warning {
    margin: 1.25rem 0 0;
    padding: 0.9rem 1rem;
    border-left: 4px solid var(--pico-primary);
    color: #7d3023;
    background: #fff4e7;
    font-size: 0.88rem;
    font-weight: 700;
    line-height: 1.5;
  }

  dt {
    margin-bottom: 0.3rem;
    color: var(--pico-muted-color);
    font-size: 0.74rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  dd {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 750;
  }

  @media (min-width: 44rem) {
    .dimensions-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
