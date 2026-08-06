<script lang="ts">
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  import type { AreaInputMode } from '$lib/calculator-state';
  import type { DimensionUnit } from '$lib/calculation/units';
  import * as Field from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import type { Messages } from '$lib/i18n/messages';
  import AreaInputModeToggle from './AreaInputModeToggle.svelte';

  export type AreaInputError = 'area' | 'dimensions' | 'thickness' | 'wasteMargin';

  type Copy = Pick<
    Messages,
    | 'areaInputModeLabel'
    | 'directAreaMode'
    | 'dimensionsMode'
    | 'areaLabel'
    | 'areaHint'
    | 'widthLabel'
    | 'heightLabel'
    | 'widthUnitLabel'
    | 'heightUnitLabel'
    | 'metres'
    | 'centimetres'
    | 'dimensionsHint'
    | 'thicknessLabel'
    | 'thicknessHint'
    | 'wasteMarginLabel'
    | 'wasteMarginHint'
    | 'calculateArea'
    | 'invalidArea'
    | 'invalidDimensions'
    | 'invalidThickness'
    | 'invalidWasteMargin'
  >;

  type Props = {
    areaInputMode: AreaInputMode;
    areaInput: string;
    widthInput: string;
    widthUnit: DimensionUnit;
    heightInput: string;
    heightUnit: DimensionUnit;
    thicknessInput: string | undefined;
    wasteMarginInput: string;
    referenceThickness: string;
    validationError: AreaInputError | null;
    placeholder: string;
    copy: Copy;
    onAreaInputModeChange: (mode: AreaInputMode) => void;
    onAreaInputChange: () => void;
    onWidthInputChange: () => void;
    onWidthUnitChange: (unit: DimensionUnit) => void;
    onHeightInputChange: () => void;
    onHeightUnitChange: (unit: DimensionUnit) => void;
    onThicknessInputChange: () => void;
    onWasteMarginInputChange: () => void;
    onSubmit: (event: SubmitEvent) => void;
  };

  let {
    areaInputMode,
    areaInput = $bindable(),
    widthInput = $bindable(),
    widthUnit = $bindable(),
    heightInput = $bindable(),
    heightUnit = $bindable(),
    thicknessInput = $bindable(),
    wasteMarginInput = $bindable(),
    referenceThickness,
    validationError,
    placeholder,
    copy,
    onAreaInputModeChange,
    onAreaInputChange,
    onWidthInputChange,
    onWidthUnitChange,
    onHeightInputChange,
    onHeightUnitChange,
    onThicknessInputChange,
    onWasteMarginInputChange,
    onSubmit
  }: Props = $props();

  const displayedThickness = $derived(thicknessInput ?? referenceThickness);

  function changeThickness(event: Event): void {
    thicknessInput = (event.currentTarget as HTMLInputElement).value;
    onThicknessInputChange();
  }

  function changeWidthUnit(value: string | undefined): void {
    if (value !== 'm' && value !== 'cm') return;

    widthUnit = value;
    onWidthUnitChange(value);
  }

  function changeHeightUnit(value: string | undefined): void {
    if (value !== 'm' && value !== 'cm') return;

    heightUnit = value;
    onHeightUnitChange(value);
  }
</script>

<form onsubmit={onSubmit} novalidate>
  <Field.FieldGroup class="gap-5">
    <AreaInputModeToggle
      value={areaInputMode}
      label={copy.areaInputModeLabel}
      directLabel={copy.directAreaMode}
      dimensionsLabel={copy.dimensionsMode}
      onChange={onAreaInputModeChange}
    />

    {#if areaInputMode === 'direct'}
      <Field.Field data-invalid={validationError === 'area'}>
        <Field.FieldLabel for="area">{copy.areaLabel}</Field.FieldLabel>
        <div class="relative">
          <Input
            id="area"
            bind:value={areaInput}
            oninput={onAreaInputChange}
            aria-describedby={validationError === 'area' ? 'area-hint area-error' : 'area-hint'}
            aria-invalid={validationError === 'area' ? 'true' : undefined}
            inputmode="decimal"
            autocomplete="off"
            type="text"
            placeholder={placeholder}
            class="min-h-12 pr-14 text-lg font-semibold"
          />
          <span
            class="pointer-events-none absolute inset-y-0 right-4 flex items-center font-semibold text-foreground"
            aria-hidden="true"
          >m²</span>
        </div>
        <Field.FieldDescription id="area-hint">{copy.areaHint}</Field.FieldDescription>
        {#if validationError === 'area'}
          <Field.FieldError id="area-error">{copy.invalidArea}</Field.FieldError>
        {/if}
      </Field.Field>
    {:else}
      <Field.FieldSet class="gap-4">
        <Field.FieldLegend class="sr-only">{copy.dimensionsMode}</Field.FieldLegend>
        <Field.Field data-invalid={validationError === 'dimensions'}>
          <Field.FieldGroup class="grid gap-5 sm:grid-cols-2">
            <Field.Field>
              <Field.FieldLabel for="width">{copy.widthLabel}</Field.FieldLabel>
              <div class="flex min-w-0 gap-2">
                <Input
                  id="width"
                  bind:value={widthInput}
                  oninput={onWidthInputChange}
                  aria-describedby={validationError === 'dimensions' ? 'dimensions-hint dimensions-error' : 'dimensions-hint'}
                  aria-invalid={validationError === 'dimensions' ? 'true' : undefined}
                  inputmode="decimal"
                  autocomplete="off"
                  type="text"
                  placeholder={placeholder}
                  class="min-h-12 min-w-0 flex-1 text-lg font-semibold"
                />
                <Select.Root
                  type="single"
                  name="width-unit"
                  value={widthUnit}
                  onValueChange={changeWidthUnit}
                >
                  <Select.Trigger
                    id="width-unit"
                    class="min-h-12 min-w-32 flex-1 rounded-lg border-border bg-background"
                    aria-label={copy.widthUnitLabel}
                  >
                    {widthUnit === 'm' ? copy.metres : copy.centimetres}
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>{copy.widthUnitLabel}</Select.Label>
                      <Select.Item class="min-h-11" value="m" label={copy.metres}>{copy.metres}</Select.Item>
                      <Select.Item class="min-h-11" value="cm" label={copy.centimetres}>{copy.centimetres}</Select.Item>
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </div>
            </Field.Field>

            <Field.Field>
              <Field.FieldLabel for="height">{copy.heightLabel}</Field.FieldLabel>
              <div class="flex min-w-0 gap-2">
                <Input
                  id="height"
                  bind:value={heightInput}
                  oninput={onHeightInputChange}
                  aria-describedby={validationError === 'dimensions' ? 'dimensions-hint dimensions-error' : 'dimensions-hint'}
                  aria-invalid={validationError === 'dimensions' ? 'true' : undefined}
                  inputmode="decimal"
                  autocomplete="off"
                  type="text"
                  placeholder={placeholder}
                  class="min-h-12 min-w-0 flex-1 text-lg font-semibold"
                />
                <Select.Root
                  type="single"
                  name="height-unit"
                  value={heightUnit}
                  onValueChange={changeHeightUnit}
                >
                  <Select.Trigger
                    id="height-unit"
                    class="min-h-12 min-w-32 flex-1 rounded-lg border-border bg-background"
                    aria-label={copy.heightUnitLabel}
                  >
                    {heightUnit === 'm' ? copy.metres : copy.centimetres}
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      <Select.Label>{copy.heightUnitLabel}</Select.Label>
                      <Select.Item class="min-h-11" value="m" label={copy.metres}>{copy.metres}</Select.Item>
                      <Select.Item class="min-h-11" value="cm" label={copy.centimetres}>{copy.centimetres}</Select.Item>
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </div>
            </Field.Field>
          </Field.FieldGroup>
          <Field.FieldDescription id="dimensions-hint">{copy.dimensionsHint}</Field.FieldDescription>
          {#if validationError === 'dimensions'}
            <Field.FieldError id="dimensions-error">{copy.invalidDimensions}</Field.FieldError>
          {/if}
        </Field.Field>
      </Field.FieldSet>
    {/if}

    <Field.Field data-invalid={validationError === 'thickness'}>
      <Field.FieldLabel for="thickness">{copy.thicknessLabel}</Field.FieldLabel>
      <div class="relative">
        <Input
          id="thickness"
          value={displayedThickness}
          oninput={changeThickness}
          aria-describedby={validationError === 'thickness' ? 'thickness-hint thickness-error' : 'thickness-hint'}
          aria-invalid={validationError === 'thickness' ? 'true' : undefined}
          inputmode="decimal"
          autocomplete="off"
          type="text"
          class="min-h-12 pr-14 text-lg font-semibold"
        />
        <span
          class="pointer-events-none absolute inset-y-0 right-4 flex items-center font-semibold text-foreground"
          aria-hidden="true"
        >mm</span>
      </div>
      <Field.FieldDescription id="thickness-hint">{copy.thicknessHint}</Field.FieldDescription>
      {#if validationError === 'thickness'}
        <Field.FieldError id="thickness-error">{copy.invalidThickness}</Field.FieldError>
      {/if}
    </Field.Field>

    <Field.Field data-invalid={validationError === 'wasteMargin'}>
      <Field.FieldLabel for="waste-margin">{copy.wasteMarginLabel}</Field.FieldLabel>
      <div class="relative">
        <Input
          id="waste-margin"
          bind:value={wasteMarginInput}
          oninput={onWasteMarginInputChange}
          aria-describedby={validationError === 'wasteMargin' ? 'waste-margin-hint waste-margin-error' : 'waste-margin-hint'}
          aria-invalid={validationError === 'wasteMargin' ? 'true' : undefined}
          inputmode="decimal"
          autocomplete="off"
          type="text"
          class="min-h-12 pr-10 text-lg font-semibold"
        />
        <span
          class="pointer-events-none absolute inset-y-0 right-4 flex items-center font-semibold text-foreground"
          aria-hidden="true"
        >%</span>
      </div>
      <Field.FieldDescription id="waste-margin-hint">{copy.wasteMarginHint}</Field.FieldDescription>
      {#if validationError === 'wasteMargin'}
        <Field.FieldError id="waste-margin-error">{copy.invalidWasteMargin}</Field.FieldError>
      {/if}
    </Field.Field>

    <Button type="submit" size="lg" class="min-h-11 w-full">
      {copy.calculateArea}
      <ArrowRight data-icon="inline-end" />
    </Button>
  </Field.FieldGroup>
</form>
