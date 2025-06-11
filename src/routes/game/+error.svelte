<script lang="ts">
    import { page } from '$app/stores';
</script>

<h1 class="h1">Error: {$page.status}</h1>

<p>Something went wrong trying to access that game</p>
<p>The specific error message received was: <code>{$page.error?.message}</code></p>

{#if $page.status === 403}
    <p>
        Looks like this contract is managed by another wallet. Click below to play the game,
        instead.
    </p>
    <a href="./play" class="btn preset-filled-primary-500">Play</a>
{/if}
