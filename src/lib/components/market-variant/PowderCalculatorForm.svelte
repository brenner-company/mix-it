<script lang="ts">
  import ArrowRight from '@lucide/svelte/icons/arrow-right';

  import * as Field from '$lib/components/ui/field/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import type { Messages } from '$lib/i18n/messages';

  type Copy = Pick<Messages, 'powderLabel' | 'powderHint' | 'calculate'>;

  type Props = {
    powderInput: string;
    validationMessage: string;
    placeholder: string;
    copy: Copy;
    onSubmit: (event: SubmitEvent) => void;
  };

  let {
    powderInput = $bindable(),
    validationMessage,
    placeholder,
    copy,
    onSubmit
  }: Props = $props();
</script>

<form onsubmit={onSubmit} novalidate>
  <Field.FieldGroup class="gap-5">
    <Field.Field data-invalid={Boolean(validationMessage)}>
      <Field.FieldLabel for="powder-mass">{copy.powderLabel}</Field.FieldLabel>
      <div class="relative">
        <Input
          id="powder-mass"
          bind:value={powderInput}
          aria-describedby={validationMessage ? 'powder-hint powder-error' : 'powder-hint'}
          aria-invalid={validationMessage ? 'true' : undefined}
          inputmode="decimal"
          autocomplete="off"
          type="text"
          placeholder={placeholder}
          class="min-h-12 pr-12 text-lg font-semibold"
        />
        <span
          class="pointer-events-none absolute inset-y-0 right-4 flex items-center font-semibold text-muted-foreground"
          aria-hidden="true"
        >kg</span>
      </div>
      <Field.FieldDescription id="powder-hint">{copy.powderHint}</Field.FieldDescription>
      <Field.FieldError id="powder-error">{validationMessage}</Field.FieldError>
    </Field.Field>

    <Button type="submit" size="lg" class="min-h-11 w-full">
      {copy.calculate}
      <ArrowRight data-icon="inline-end" />
    </Button>
  </Field.FieldGroup>
</form>
