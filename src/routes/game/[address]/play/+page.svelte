<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;

    import { getToastStore } from '@skeletonlabs/skeleton';
    import { contractId } from '$lib/stores/contractId';
    import { keyId } from '$lib/stores/keyId';
    import { account, send } from '$lib/passkeyClient';
    import diceGame from '$lib/contracts/diceGameContract';
    import { xdr, scValToNative } from '@stellar/stellar-sdk';
    import DieRoll from '$lib/components/DieRoll.svelte';

    diceGame.options.contractId = data.gameAddress;

    let rollResult: number[];
    let isWaiting: boolean = false;

    $: rollButtonDisabled = isWaiting || !$contractId;

    const toastStore = getToastStore();

    const rollDice = async () => {
        console.log('rolling dice');
        try {
            isWaiting = true;
            const at = await diceGame.roll({
                roller: $contractId
            });


            await account.sign(at, { keyId: $keyId });
            console.log('at', at)
            const res = await send(at.built!);

            let result = xdr.TransactionMeta.fromXDR(res.resultMetaXdr, 'base64');
            // @ts-ignore
            rollResult = scValToNative(result.value().sorobanMeta().returnValue());

            toastStore.trigger({
                message: 'Successfully rolled the dice! Congrats',
                background: 'variant-filled-success'
            });
        } catch (err) {
            console.log('err', err);
            toastStore.trigger({
                message: 'Something went wrong rolling dice. Please try again later.',
                background: 'variant-filled-error'
            });
        } finally {
            isWaiting = false;
        }
    };
</script>

<h1 class="h1">Play Game</h1>
<p>Playing game <code>{data.gameAddress}</code></p>

<button
    type="button"
    class="btn variant-filled-primary mr-2"
    on:click={rollDice}
    disabled={rollButtonDisabled}>Roll!</button
>

{#if rollResult}
    <section class="mt-4 space-y-6">
        <h2 class="h2 text-center" data-ignore-toc>
            Total: {rollResult.reduce((acc, i) => acc + i)}
        </h2>
        <div class="w-full flex flex-wrap gap-1 justify-center">
            {#each rollResult as dieResult}
                <DieRoll rolledNumber={dieResult} />
            {/each}
        </div>
    </section>
{/if}
