<script lang="ts">
    import type { Roller } from 'dice-game';

    export let tokenSymbol: string;
    export let tokenBalance: string;
    export let roller: Roller;

    let tSymbol = tokenSymbol === 'native' ? 'XLM' : tokenSymbol;
</script>

<div class="card">
    <header class="card-header">
        <h3 class="h3" data-toc-ignore>Player Stats</h3>
    </header>
    <section class="p-4">
        <dl class="list-dl">
            <div>
                <span class="w-full flex flex-row justify-between">
                    <dt class="font-bold">Buy-In</dt>
                    <dd class="opacity-50">
                        {#if roller}
                            {roller.first_roll} {tSymbol}
                        {:else}
                            <div class="placeholder"></div>
                        {/if}
                    </dd>
                </span>
            </div>
            <div>
                <span class="w-full flex flex-row justify-between">
                    <dt class="font-bold">Highest Roll</dt>
                    <dd class="opacity-50">
                        {#if roller}
                            {roller.high_roll}
                        {:else}
                            <div class="placeholder"></div>
                        {/if}
                    </dd>
                </span>
            </div>
            <div>
                <span class="w-full flex flex-row justify-between">
                    <dt class="font-bold">Total Rolls</dt>
                    <dd class="opacity-50">
                        {#if roller}
                            {roller.times_rolled}
                        {:else}
                            <div class="placeholder"></div>
                        {/if}
                    </dd>
                </span>
            </div>
            <div>
                <span class="w-full flex flex-row justify-between">
                    <dt class="font-bold">Balance</dt>
                    <dd class="opacity-50">
                        {#if tokenBalance}
                            {parseInt(tokenBalance) / 10_000_000} {tSymbol}
                        {:else}
                            <div class="placeholder"></div>
                        {/if}
                    </dd>
                </span>
            </div>
        </dl>
    </section>
</div>
