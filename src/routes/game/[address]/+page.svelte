<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
</script>

<h1 class="h1">Game Time!</h1>
<p>Let's take a look at this game: <code>{data.gameAddress}</code></p>

<a href={`${data.gameAddress}/play`} class="btn variant-filled-primary">Play the game</a>
<a href={`${data.gameAddress}/manage`} class="btn variant-filled-secondary">Manage the game</a>
