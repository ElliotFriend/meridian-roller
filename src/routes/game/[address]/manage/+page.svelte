<script lang="ts">
    import { page } from '$app/stores';
    import qrCode from 'qrcode';
    import { contractAddress } from '$lib/stores/contractAddress';
    import { keyId } from '$lib/stores/keyId';
    import { account, send } from '$lib/passkeyClient';
    import { createClient } from '$lib/contracts/dice_game';
    import Leaderboard from '$lib/components/Leaderboard.svelte';
    import GameStats from '$lib/components/GameStats.svelte';
    import { toaster } from '$lib/toaster';

    import type { PageProps } from './$types';
    let { data }: PageProps = $props();

    let diceGame = createClient(data.gameAddress);

    let isWaiting: boolean = $state(false);
    let calledIt: boolean = $state(false);

    let isButtonDisabled = $derived(!$contractAddress || isWaiting || data.gameWinner);

    let qrDataUrl = $state(qrCode.toDataURL($page.url.href.replace('manage', 'play'), {
        errorCorrectionLevel: 'high',
    }));

    async function callIt() {
        console.log('calling it a day');
        try {
            isWaiting = true;
            const at = await diceGame.call_it();

            await account.sign(at, { keyId: $keyId });
            await send(at.built!);

            calledIt = true;
            toaster.success({
                description:
                    "Hooray! Everyone is a winner, now! I'll start handing out the participation trophies.",
            });
        } catch (err) {
            console.log('err', err);
            toaster.error({
                description: 'Something went wrong ending the game. Please try again later.',
            });
        } finally {
            isWaiting = false;
        }
    }

    async function beEvil() {
        console.log('evil admin!');
        try {
            isWaiting = true;

            const at = await diceGame.be_evil();

            await account.sign(at, { keyId: $keyId });
            await send(at.built!);

            toaster.success({
                description: 'Welp... You stole from everyone... hooray?',
            });
        } catch (err) {
            console.log('err', err);
            toaster.error({
                description: 'Something went wrong being evil. Serves you right!',
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
                    class="btn preset-filled-tertiary-500"
                    disabled={isButtonDisabled}
                    onclick={beEvil}>Be evil!</button
                >
            {:else}
                <button
                    class="btn preset-filled-primary-500"
                    disabled={isButtonDisabled}
                    onclick={callIt}>Call it!</button
                >
            {/if}
        </section>
    </div>
    <div class="md:col-span-8">
        <Leaderboard />
    </div>
</div>
