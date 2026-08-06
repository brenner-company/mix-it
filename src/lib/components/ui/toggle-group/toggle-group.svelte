<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';

  let {
    class: className,
    value = $bindable(),
    children,
    ...restProps
  }: ToggleGroupPrimitive.RootProps = $props();
</script>

<ToggleGroupPrimitive.Root
  data-slot="toggle-group"
  class={cn(
    'flex w-full items-center gap-1 rounded-2xl bg-muted p-1 text-foreground',
    className
  )}
  bind:value={value as never}
  {...restProps}
>
  {@render children?.()}
</ToggleGroupPrimitive.Root>
