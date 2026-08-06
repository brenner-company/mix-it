<script lang="ts">
  let { children } = $props();
</script>

<main class="mx-auto w-[calc(100%_-_2rem)] max-w-[70rem] sm:w-[calc(100%_-_4rem)]">
  {@render children()}
</main>
