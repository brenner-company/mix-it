<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';

  let {
    class: className,
    children: childrenProp,
    ...restProps
  }: ToggleGroupPrimitive.ItemProps = $props();
</script>

<ToggleGroupPrimitive.Item
  data-slot="toggle-group-item"
  class={cn(
    'inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 py-2 text-sm font-medium outline-none transition-[color,box-shadow] hover:bg-background/70 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm',
    className
  )}
  {...restProps}
>
  {#snippet children({ pressed })}
    {@render childrenProp?.({ pressed })}
  {/snippet}
</ToggleGroupPrimitive.Item>
