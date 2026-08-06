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
  import AreaCalculationResult from '$lib/components/market-variant/AreaCalculationResult.svelte';
  import AreaCalculatorForm from '$lib/components/market-variant/AreaCalculatorForm.svelte';
  import type { AreaInputError } from '$lib/components/market-variant/AreaCalculatorForm.svelte';
  import CatalogReviewTraceability from '$lib/components/market-variant/CatalogReviewTraceability.svelte';
  import CalculatorModeToggle from '$lib/components/market-variant/CalculatorModeToggle.svelte';
  import ManufacturerGuidance from '$lib/components/market-variant/ManufacturerGuidance.svelte';
  import PowderCalculationResult from '$lib/components/market-variant/PowderCalculationResult.svelte';
  import PowderCalculatorForm from '$lib/components/market-variant/PowderCalculatorForm.svelte';
  import {
    calculateAreaSquareMetresFromDimensions,
    formatEnteredPowderMass,
    formatLiquidQuantity,
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
  import * as Alert from '$lib/components/ui/alert/index.js';
  import * as Card from '$lib/components/ui/card/index.js';

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

  function changeLanguage(selectedLanguage: Language): void {
    language = selectLanguage(selectedLanguage);
  }

  function changeMarket(selectedMarket: Market): void {
    selectMarket(selectedMarket);
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
    areaValidationError = null;
  }

  function clearActiveAreaState(): void {
    clearActiveAreaCalculation();
    areaValidationError = null;
  }

  function clearAllAreaState(): void {
    directAreaCalculation = null;
    dimensionsAreaCalculation = null;
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
    if (parsedWidth === null && parsedHeight === null) return { error: 'dimensions' };
    if (parsedWidth === null) return { error: 'width' };
    if (parsedHeight === null) return { error: 'height' };

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
      return;
    }

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

<AppTopbar
  {language}
  {market}
  markets={supportedMarkets}
  {copy}
  onLanguageChange={changeLanguage}
  onMarketChange={changeMarket}
/>

  <div class="py-8 pb-4">
    <a class="text-sm text-muted-foreground no-underline hover:text-foreground" href="/">
      ← {copy.backToCatalog}
    </a>
  </div>

  <section class="py-4 pb-8 sm:py-8 sm:pb-12" aria-labelledby="product-title">
    <p class="mb-[0.65rem] text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
      {translation.category} · {variant.market} · {variant.productCode}
    </p>
    <h1
      id="product-title"
      class="mb-3 max-w-[14ch] text-[clamp(2.8rem,12vw,5.5rem)] leading-[0.94] tracking-[-0.08em]"
    >{translation.name}</h1>
    <p class="product-family mb-0 text-muted-foreground">
      {copy.productFamily}: {variant.productFamilyId}
    </p>
  </section>

  <section aria-labelledby="calculator-title">
    <Card.Root
      class="grid gap-8 p-4 sm:grid-cols-[0.85fr_1.15fr] sm:gap-10 sm:p-8"
    >
      <Card.Header class="gap-3 px-0 py-0 sm:py-2.5">
        <p class="mb-[0.65rem] text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
          {copy.calculatorEyebrow}
        </p>
        <Card.Title>
          <h2 id="calculator-title" class="mb-0 text-3xl tracking-tight">{copy.calculatorTitle}</h2>
        </Card.Title>
        <Card.Description class="max-w-prose leading-relaxed">
          {copy.calculatorIntro}
        </Card.Description>
        <p class="mb-0 text-sm leading-relaxed text-muted-foreground">
          {copy.quantityFormatHint(formatQuantityExample(market))}
        </p>
      </Card.Header>

    <div class="sm:col-start-2">
      <CalculatorModeToggle
        value={calculatorMode}
        areaAvailable={areaAvailable}
        label={copy.calculatorModeLabel}
        powderLabel={copy.powderMode}
        areaLabel={copy.areaMode}
        onChange={selectCalculatorMode}
      />
    </div>

    {#if !areaAvailable}
      <Card.Content class="px-0 py-0 sm:col-start-2" role="status">
        <Alert.Root variant="default" role="status">
          <Alert.AlertTitle>{copy.areaMode}</Alert.AlertTitle>
          <Alert.AlertDescription>{copy.areaUnavailable}</Alert.AlertDescription>
        </Alert.Root>
      </Card.Content>
    {/if}

    {#if calculatorMode === 'powder'}
      <Card.Content class="px-0 py-0 sm:col-start-2">
        <PowderCalculatorForm
          bind:powderInput
          {validationMessage}
          placeholder={language === 'nl' ? '12,5' : '12.5'}
          {copy}
          onSubmit={calculate}
        />
      </Card.Content>
    {:else if areaAvailable}
      <Card.Content class="px-0 py-0 sm:col-start-2">
        <AreaCalculatorForm
          bind:areaInput
          bind:widthInput
          bind:widthUnit
          bind:heightInput
          bind:heightUnit
          bind:thicknessInput
          bind:wasteMarginInput
          {areaInputMode}
          referenceThickness={variant.referenceConsumption?.referenceThicknessMm?.toString() ?? ''}
          validationError={areaValidationError}
          placeholder={language === 'nl' ? '2,5' : '2.5'}
          {copy}
          onAreaInputModeChange={selectAreaInputMode}
          onAreaInputChange={clearActiveAreaState}
          onWidthInputChange={clearActiveAreaState}
          onWidthUnitChange={clearActiveAreaState}
          onHeightInputChange={clearActiveAreaState}
          onHeightUnitChange={clearActiveAreaState}
          onThicknessInputChange={clearAllAreaState}
          onWasteMarginInputChange={clearAllAreaState}
          onSubmit={calculateArea}
        />
      </Card.Content>
    {/if}

    {#if calculatorMode === 'powder' && liquid !== null}
      <div class="sm:col-span-2">
        <PowderCalculationResult
          liquid={formatLiquidQuantity(liquid, market)}
          enteredPowder={enteredPowderDisplay}
          {copy}
        />
      </div>
    {:else if calculatorMode === 'area' && areaCalculation !== null}
      <div class="sm:col-span-2">
        <AreaCalculationResult
          calculation={areaCalculation}
          {market}
          supportedThicknessRange={variant.supportedThicknessRange}
          {copy}
        />
      </div>
    {/if}

    {#if showGuidance}
      <ManufacturerGuidance
        {translation}
        packagingLabel={variant.packaging.packageLabel}
        {copy}
      />
    {/if}
    </Card.Root>
  </section>

  <CatalogReviewTraceability {variant} {copy} />
