<script lang="ts">
    import { fade } from 'svelte/transition';
    import Info from 'lucide-svelte/icons/info';

    export let numDice: number;
    export let numFaces: 2 | 3 | 4 | 6 | 8 | 10 | 12 | 20;
</script>

{#if numDice && numFaces}
    <aside class="alert variant-filled-surface" transition:fade={{ duration: 200 }}>
        <div><Info size={36} /></div>
        <div class="alert-message">
            <h3 class="h3">Just a heads up</h3>
            <p>
                Based on your selected dice configuration, there is about a <strong
                    >1 in {numFaces ** numDice} chance</strong
                >
                that someone will hit the jackpot (that is, all dice landing on {numFaces}). Do with
                that information what you will.
            </p>
        </div>
    </aside>
{/if}
