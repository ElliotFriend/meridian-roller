<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
    console.log('src/routes/game/[address]/play/+page.svelte PageData', data);

    import { getToastStore } from '@skeletonlabs/skeleton';
    import { contractAddress } from '$lib/stores/contractAddress';
    import { keyId } from '$lib/stores/keyId';
    import { account, send, rpc, native } from '$lib/passkeyClient';
    import diceGame from '$lib/contracts/dice_game';
    import { xdr, scValToNative, nativeToScVal, Address } from '@stellar/stellar-sdk';
    import DieRoll from '$lib/components/DieRoll.svelte';
    import type { Roller } from 'dice_game';
    import GameStats from '$lib/components/GameStats.svelte';
    import RollerStats from '$lib/components/RollerStats.svelte';
    import { onMount } from 'svelte';
    import Leaderboard from '$lib/components/Leaderboard.svelte';
    import { invalidate } from '$app/navigation';
    import TruncatedAddress from '$lib/components/TruncatedAddress.svelte';

    const toastStore = getToastStore();
    diceGame.options.contractId = data.gameAddress;

    let rollResult: number[] = [0, 0, 0];
    let isWaiting: boolean = false;
    let rollerStruct: Roller;
    let rollerBalance: string;
    let youWon: boolean = false;
    let wonAmount: number = 0;
    $: rollButtonDisabled = isWaiting || !$contractAddress || data.gameWinner;

    const fetchRoller = async () => {
        console.log('fetching roller');
        if ($contractAddress) {
            const ledgerKey = xdr.LedgerKey.contractData(
                new xdr.LedgerKeyContractData({
                    contract: new Address(data.gameAddress).toScAddress(),
                    key: nativeToScVal(
                        [
                            nativeToScVal('Roller', { type: 'symbol' }),
                            nativeToScVal($contractAddress, { type: 'address' })
                        ],
                        { type: 'vec' }
                    ),
                    durability: xdr.ContractDataDurability.persistent()
                })
            );
            const ledgerEntry = await rpc.getLedgerEntries(ledgerKey);
            if (ledgerEntry.entries.length) {
                rollerStruct = scValToNative(ledgerEntry.entries[0].val.contractData().val());
            }

            if (rollerStruct.high_roll === data.numFaces * 3) {
                youWon = true;
            }

            let { result } = await native.balance({
                id: $contractAddress
            });
            rollerBalance = result.toString();
        }
    };

    const fetchInstance = async () => {
        console.log('fetching instance');
        await invalidate('instance:storage');
    };

    const rollDice = async () => {
        console.log('rolling dice');
        try {
            isWaiting = true;
            const at = await diceGame.roll({
                roller: $contractAddress
            });

            const tx = await account.sign(at.built!, { keyId: $keyId });
            const res = await send(tx.built!);

            let result = xdr.TransactionMeta.fromXDR(res.resultMetaXdr, 'base64');
            let sMeta = result.v3().sorobanMeta();
            if (sMeta) {
                rollResult = scValToNative(sMeta.returnValue());
            }
            console.log('rolled result', rollResult);

            toastStore.trigger({
                message: 'Successfully rolled the dice! Congrats',
                background: 'variant-filled-success'
            });
            fetchRoller();
        } catch (err) {
            console.log('err', err);
            toastStore.trigger({
                message: 'Something went wrong rolling dice. Please try again later.',
                background: 'variant-filled-error'
            });
        } finally {
            fetchInstance();
            isWaiting = false;
        }
    };

    onMount(async () => {
        await fetchRoller();
    });
</script>

<h1 class="h1">Play Game</h1>

{#if $contractAddress}
    <p>
        Your smart wallet address is: <TruncatedAddress address={$contractAddress} />
    </p>
{/if}

<div class="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
    <div class="md:col-span-8 space-y-4">
        <section class="space-y-6">
            {#if youWon}
                <h2 class="h2 text-center" data-ignore-toc>You won!! 🎉</h2>
                <p class="text-center">Congratulations! You've won {wonAmount} XLM. Enjoy!</p>
            {:else}
                <h2 class="h2 text-center" data-ignore-toc>
                    Total: {rollResult.reduce((acc, i) => acc + i) || '?'}
                </h2>
            {/if}
            <div class="w-full flex flex-wrap gap-1 justify-center">
                {#each rollResult as dieResult}
                    <DieRoll rolledNumber={dieResult} />
                {/each}
            </div>
            <div class="text-center">
                <button
                    type="button"
                    class="btn variant-filled-primary"
                    on:click={rollDice}
                    disabled={rollButtonDisabled || youWon}>Roll!</button
                >
            </div>
        </section>
    </div>
    <div class="grid grid-cols-2 md:col-span-4 gap-4">
        <GameStats />

        <RollerStats
            tokenSymbol={data.tokenSymbol}
            tokenBalance={rollerBalance}
            roller={rollerStruct}
        />
    </div>
</div>
