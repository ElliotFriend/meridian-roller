<script lang="ts">
    import type { PageProps } from './$types';
    let { data }: PageProps = $props();
    console.log('src/routes/game/[address]/play/+page.svelte PageData', data);
    import { contractAddress } from '$lib/stores/contractAddress';
    import { keyId } from '$lib/stores/keyId';
    import { account, send, rpc, native } from '$lib/passkeyClient';
    import { createClient } from '$lib/contracts/dice_game';
    import { xdr, scValToNative, nativeToScVal, Address } from '@stellar/stellar-sdk/minimal';
    import DieRoll from '$lib/components/DieRoll.svelte';
    import type { Roller } from 'dice_game';
    import GameStats from '$lib/components/GameStats.svelte';
    import RollerStats from '$lib/components/RollerStats.svelte';
    import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import TruncatedAddress from '$lib/components/TruncatedAddress.svelte';
    import { toaster } from '$lib/toaster';

    let diceGame = createClient(data.gameAddress);

    let rollResult: number[] = $state(Array.from({ length: data.numDice }, () => 0));
    let isWaiting: boolean = $state(false);
    let rollerStruct: Roller | undefined = $state();
    let rollerBalance: string = $state('');
    let youWon: boolean = $state(false);
    let wonAmount: number = $state(0);
    let rollButtonDisabled = $derived(isWaiting || !$contractAddress || data.gameWinner);

    const fetchRoller = async () => {
        console.log('fetching roller');
        if ($contractAddress) {
            const ledgerKey = xdr.LedgerKey.contractData(
                new xdr.LedgerKeyContractData({
                    contract: new Address(data.gameAddress).toScAddress(),
                    key: nativeToScVal(
                        [
                            nativeToScVal('Roller', { type: 'symbol' }),
                            nativeToScVal($contractAddress, { type: 'address' }),
                        ],
                        { type: 'vec' },
                    ),
                    durability: xdr.ContractDataDurability.persistent(),
                }),
            );
            const ledgerEntry = await rpc.getLedgerEntries(ledgerKey);
            if (ledgerEntry.entries.length) {
                rollerStruct = scValToNative(ledgerEntry.entries[0].val.contractData().val());
            }

            if (rollerStruct?.high_roll === data.numFaces * 3) {
                youWon = true;
            }

            let { result } = await native.balance({
                id: $contractAddress,
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
            let at = await diceGame.roll({
                roller: $contractAddress,
            });
            console.log('at', at);

            await account.sign(at, { keyId: $keyId });
            const res = await send(at.built!);

            let result = xdr.TransactionMeta.fromXDR(res.resultMetaXdr, 'base64');
            let sMeta = result.v3().sorobanMeta();
            if (sMeta) {
                rollResult = scValToNative(sMeta.returnValue());
            }
            console.log('rolled result', rollResult);

            toaster.success({
                description: 'Successfully rolled the dice! Congrats',
            });
            fetchRoller();
        } catch (err) {
            console.log('err', err);
            toaster.error({
                description: 'Something went wrong rolling dice. Please try again later.',
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
        Your smart wallet address is: <TruncatedAddress text={$contractAddress} />
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
                    Total: {rollResult.reduce((acc, i) => acc + i, 0) || '?'}
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
                    class="btn preset-filled-primary-500"
                    onclick={rollDice}
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
