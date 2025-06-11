<script lang="ts">
    import TruncatedAddress from '$lib/components/TruncatedAddress.svelte';
    import { page } from '$app/state';
    import type { LayoutProps } from './$types';
    let pathname = $derived(page.url.pathname.split('/').filter((p) => p));
    let { children }: LayoutProps = $props()

    function capitalized(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
</script>

<ol class="breadcrumb-nonresponsive flex">
    <li class="crumb"><a class="anchor" href="/">Home</a></li>
    <li class="crumb-separator" aria-hidden="true">›</li>
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
            <li class="crumb-separator" aria-hidden="true">›</li>
        {/if}
    {/each}
</ol>

{@render children()}
