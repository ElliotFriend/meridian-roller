<script lang="ts">
    import TruncatedAddress from '$lib/components/TruncatedAddress.svelte';
    import { page } from '$app/stores';
    $: pathname = $page.url.pathname.split('/').filter((p) => p);

    function capitalized(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1)
    }
</script>

<ol class="breadcrumb-nonresponsive flex">
    <li class="crumb"><a class="anchor" href="/">Home</a></li>
    <li class="crumb-separator" aria-hidden>&rsaquo;</li>
    {#each pathname as segment, i}
        {@const pathToHere = pathname.slice(0, i + 1).join('/')}
        {#if i == pathname.length - 1}
            <li>{capitalized(segment)}</li>
        {:else}
            <li class="crumb flex-initial">
                <a class="anchor" href={`/${pathToHere}`}>
                    {#if segment.startsWith('C')}
                        <div class="overflow-hidden">
                            <div class="overflow-hidden">
                            <TruncatedAddress address={segment} />
                            </div>
                        </div>
                    {:else}
                        {capitalized(segment)}
                    {/if}
                </a>
            </li>
            <li class="crumb-separator" aria-hidden>&rsaquo;</li>
        {/if}
    {/each}
</ol>

<slot />
