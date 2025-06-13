<script lang="ts">
    import TruncatedAddress from '$lib/components/TruncatedAddress.svelte';
    import { page } from '$app/state';
    import type { LayoutProps } from './$types';
    let pathname = $derived(page.url.pathname.split('/').filter((p) => p));
    let { children }: LayoutProps = $props();

    function capitalized(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
</script>

<ol class="flex gap-4">
    <li class="crumb"><a class="anchor" href="/">Home</a></li>
    <li class="crumb-separator" aria-hidden="true">›</li>
    {#each pathname as segment, i}
        {@const pathToHere = pathname.slice(0, i + 1).join('/')}
        {#if i == pathname.length - 1}
            <li>
                {#if segment.startsWith('C')}
                    <TruncatedAddress text={segment} />
                {:else}
                    {capitalized(segment)}
                {/if}
            </li>
        {:else}
            <li class="crumb flex-initial">
                <a class="anchor" href={`/${pathToHere}`}>
                    {#if segment.startsWith('C')}
                        <TruncatedAddress text={segment} />
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
