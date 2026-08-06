<script lang="ts">
  import '../../src/app.css';
  import AppShell from '$lib/components/AppShell.svelte';

  let { children } = $props();
</script>

<AppShell>
  {@render children()}
</AppShell>
