<script lang="ts">
    import { page } from '$app/stores';
    import TruncatedAddress from './TruncatedAddress.svelte';
    import { invalidate } from '$app/navigation';

    const fetchInstance = async () => {
        await invalidate('instance:storage');
    };
</script>

<div class="card">
    <header class="card-header">
        <h3 class="h3" data-toc-ignore>Game Stats</h3>
    </header>
    <section class="p-4">
        <dl class="list-dl">
            <div>
                <span class="w-full flex flex-row justify-between">
                    <dt class="font-bold">Faces</dt>
                    <dd class="opacity-50">{$page.data.numFaces}</dd>
                </span>
            </div>
            <div>
                <span class="w-full flex flex-row justify-between">
                    <dt class="font-bold">Prize Pot</dt>
                    <dd class="opacity-50">
                        {parseInt($page.data.prizePot) / 10_000_000}
                        {$page.data.tokenSymbol === 'native' ? 'XLM' : $page.data.tokenSymbol}
                    </dd>
                </span>
            </div>
            {#if $page.data.gameWinner}
                <div>
                    <span class="flex-auto max-w-full">
                        <dt class="font-bold">Winner</dt>
                        <dd class="opacity-50">
                            <TruncatedAddress address={$page.data.gameWinner} />
                        </dd>
                    </span>
                </div>
            {/if}
        </dl>
        <button class="btn variant-filled-primary" onclick={fetchInstance}>re-fetch</button>
    </section>
</div>
