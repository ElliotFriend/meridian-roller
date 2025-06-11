<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
</script>

<h1 class="h1">Game Time!</h1>
<p>Let's take a look at this game: <code class="code">{data.gameAddress.slice(0, 6)}...</code></p>

<a href={`${data.gameAddress}/play`} class="btn preset-filled-primary-500">Play the game</a>
<a href={`${data.gameAddress}/manage`} class="btn preset-filled-secondary-500">Manage the game</a>
