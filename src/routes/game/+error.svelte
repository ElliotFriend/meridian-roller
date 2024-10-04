<script lang="ts">
    import { page } from '$app/stores';
</script>

<h1 class="h1">Error: {$page.status}</h1>

<p>Something went wrong trying to access that game</p>
<p>The specific error message received was: <code>{$page.error?.message}</code></p>

