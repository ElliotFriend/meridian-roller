<script lang="ts">
    import { fade } from 'svelte/transition';
    import Info from 'lucide-svelte/icons/info';

    export let numDice: number;
    export let numFaces: 2 | 3 | 4 | 6 | 8 | 10 | 12 | 20;
</script>

{#if numDice && numFaces}
    <aside class="w-full space-y-8">
        <div
            class="card preset-outlined-surface-950-50 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]"
            transition:fade={{ duration: 200 }}
        >
            <Info size={36} />
            <div>
                <p class="font-bold">Just a heads up</p>
                <p class="text-xs opacity-60">
                    Based on your selected dice configuration, there is about a <strong
                        >1 in {numFaces ** numDice} chance</strong
                    >
                    that someone will hit the jackpot (that is, all dice landing on {numFaces}). Do
                    with that information what you will.
                </p>
            </div>
        </div>
    </aside>
{/if}
