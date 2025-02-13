<script lang="ts">
    import { page } from '$app/stores';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import qrCode from 'qrcode';
    import { contractAddress } from '$lib/stores/contractAddress';
    import { keyId } from '$lib/stores/keyId';
    import { account, send } from '$lib/passkeyClient';
    import diceGameSdk from '$lib/contracts/dice_game';
    import Leaderboard from '$lib/components/Leaderboard.svelte';
    import GameStats from '$lib/components/GameStats.svelte';

    import type { PageData } from './$types';
    export let data: PageData;

    diceGameSdk.options.contractId = data.gameAddress;

    let isWaiting: boolean = false;
    let calledIt: boolean = false;

    $: isButtonDisabled = !$contractAddress || isWaiting || data.gameWinner;

    const toastStore = getToastStore();

    let qrDataUrl = qrCode.toDataURL($page.url.href.replace('manage', 'play'), {
        errorCorrectionLevel: 'high'
    });

    async function callIt() {
        console.log('calling it a day');
        try {
            isWaiting = true;
            const at = await diceGameSdk.call_it();

            const tx = await account.sign(at.built!, { keyId: $keyId });
            await send(tx.built!);

            calledIt = true;
            toastStore.trigger({
                message:
                    "Hooray! Everyone is a winner, now! I'll start handing out the participation trophies.",
                background: 'variant-filled-primary'
            });
        } catch (err) {
            console.log('err', err);
            toastStore.trigger({
                message: 'Something went wrong ending the game. Please try again later.',
                background: 'variant-filled-error'
            });
        } finally {
            isWaiting = false;
        }
    }

    async function beEvil() {
        console.log('evil admin!');
        try {
            isWaiting = true;

            const at = await diceGameSdk.be_evil();

            const tx = await account.sign(at.built!, { keyId: $keyId });
            await send(tx.built!);

            toastStore.trigger({
                message: 'Welp... You stole from everyone... hooray?',
                background: 'variant-filled-tertiary'
            });
        } catch (err) {
            console.log('err', err);
            toastStore.trigger({
                message: 'Something went wrong being evil. Serves you right!',
                background: 'variant-filled-error'
            });
        } finally {
            isWaiting = false;
        }
    }
</script>

<h1 class="h1">Manage Game</h1>

<div class="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
    <div class="md:col-span-4 space-y-4">
        <section class="space-y-6 text-center">
            {#await qrDataUrl then url}
                <img class="mx-auto" src={url} alt="qr code to play this game" />
            {/await}

            <GameStats />

            <p>Is this taking too long? Click the button below, and then everybody is a winner!</p>

            {#if calledIt}
                <button
                    class="btn variant-filled-tertiary"
                    disabled={isButtonDisabled}
                    on:click={beEvil}>Be evil!</button
                >
            {:else}
                <button
                    class="btn variant-filled-primary"
                    disabled={isButtonDisabled}
                    on:click={callIt}>Call it!</button
                >
            {/if}
        </section>
    </div>
    <div class="md:col-span-8">
        <Leaderboard />
    </div>
</div>
