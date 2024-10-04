<script lang="ts">
    import { page } from '$app/stores';
    $: pathname = $page.url.pathname.split('/').filter(p => p)
</script>

<ol class="breadcrumb">
    <li class="crumb"><a class="anchor" href="/">Home</a></li>
    <li class="crumb-separator" aria-hidden>/</li>
    {#each pathname as segment, i}
        {@const pathToHere = pathname.slice(0, i + 1).join('/')}
        {#if i == pathname.length - 1}
            <li>{segment}</li>
        {:else}
            <li class="crumb"><a class="anchor" href={`/${pathToHere}`}>{segment.toUpperCase()}</a></li>
            <li class="crumb-separator" aria-hidden>/</li>
        {/if}
    {/each}
</ol>

<slot />
