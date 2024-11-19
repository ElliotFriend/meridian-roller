<script lang="ts">
    import { Dices, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, CircleHelp } from 'lucide-svelte';
    import type { Icon } from 'lucide-svelte';
    import type { ComponentType } from 'svelte';
    export let rolledNumber: number;

    const diceIcons: Record<number, ComponentType<Icon>> = {
        0: CircleHelp,
        1: Dice1,
        2: Dice2,
        3: Dice3,
        4: Dice4,
        5: Dice5,
        6: Dice6
    };
</script>

<div class="flex-none w-24">
    <div class="card p-4 flex flex-col justify-center items-center">
        <span
            ><svelte:component
                this={rolledNumber <= 6 ? diceIcons[rolledNumber] : Dices}
                size={72}
            /></span
        >
        <span class="text-3xl">{rolledNumber}</span>
    </div>
</div>
