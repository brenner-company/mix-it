<script lang="ts">
  import * as Field from '$lib/components/ui/field/index.js';
  import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
  import type { AreaInputMode } from '$lib/calculator-state';

  type Props = {
    value: AreaInputMode;
    label: string;
    directLabel: string;
    dimensionsLabel: string;
    onChange: (value: AreaInputMode) => void;
  };

  let { value, label, directLabel, dimensionsLabel, onChange }: Props = $props();
  let selectedValue = $derived<AreaInputMode | ''>(value);

  function changeValue(nextValue: string): void {
    if (nextValue === 'direct' || nextValue === 'dimensions') {
      onChange(nextValue);
      return;
    }

    // A single-selection ToggleGroup allows deselection. Area entry always has one mode.
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
    <ToggleGroup.Item value="direct">{directLabel}</ToggleGroup.Item>
    <ToggleGroup.Item value="dimensions">{dimensionsLabel}</ToggleGroup.Item>
  </ToggleGroup.Root>
</Field.FieldSet>
