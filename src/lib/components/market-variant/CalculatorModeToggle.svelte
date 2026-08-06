<script lang="ts">
  import * as Field from '$lib/components/ui/field/index.js';
  import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
  import type { CalculatorMode } from '$lib/calculator-state';

  type Props = {
    value: CalculatorMode;
    areaAvailable: boolean;
    label: string;
    powderLabel: string;
    areaLabel: string;
    onChange: (value: CalculatorMode) => void;
  };

  let { value, areaAvailable, label, powderLabel, areaLabel, onChange }: Props = $props();
  let selectedValue = $derived<CalculatorMode | ''>(value);

  function changeValue(nextValue: string): void {
    if (nextValue === 'powder' || (nextValue === 'area' && areaAvailable)) {
      onChange(nextValue);
      return;
    }

    // A single-selection ToggleGroup allows deselection. Calculator mode does not:
    // restore the previous value so the user always has one active journey.
    selectedValue = value;
  }
</script>

<Field.FieldSet class="gap-2">
  <Field.FieldLegend class="sr-only">{label}</Field.FieldLegend>
  <ToggleGroup.Root
    type="single"
    bind:value={selectedValue as never}
    aria-label={label}
    onValueChange={changeValue}
  >
    <ToggleGroup.Item value="powder">{powderLabel}</ToggleGroup.Item>
    <ToggleGroup.Item value="area" disabled={!areaAvailable}>{areaLabel}</ToggleGroup.Item>
  </ToggleGroup.Root>
</Field.FieldSet>
