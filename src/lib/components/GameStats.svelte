<script lang="ts">
    import { page } from "$app/stores";
    import TruncatedAddress from "./TruncatedAddress.svelte";
</script>

<div class="card">
    <header class="card-header">
        <h3 class="h3" data-toc-ignore>Game Stats</h3>
    </header>
    <section class="p-4">
        <dl class="list-dl">
            <div>
                <span class="flex-auto max-w-full">
                    <dt class="font-bold">Game Admin</dt>
                    <dd class="code text-sm opacity-50">
                        <TruncatedAddress address={$page.data.gameAdmin} />
                    </dd>
                </span>
            </div>
            <div>
                <span class="flex-auto">
                    <dt class="font-bold">Faces on Dice</dt>
                    <dd class="text-sm opacity-50">{$page.data.numFaces}</dd>
                </span>
            </div>
            <div>
                <span class="flex-auto max-w-full">
                    <dt class="font-bold">Token</dt>
                    <dd class="code text-sm opacity-50">
                        <TruncatedAddress address={$page.data.tokenAddress} />
                    </dd>
                </span>
            </div>
            <div>
                <span class="flex-auto">
                    <dt class="font-bold">Current Prize Pot</dt>
                    <dd class="text-sm opacity-50">{parseInt($page.data.prizePot) / 10_000_000} {$page.data.tokenSymbol === 'native' ? 'XLM' : $page.data.tokenSymbol}</dd>
                </span>
            </div>
        </dl>
    </section>
</div>
