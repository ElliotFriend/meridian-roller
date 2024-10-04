<script lang="ts">
    import { page } from '$app/stores';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import qrCode from 'qrcode'
    import { contractId } from '$lib/stores/contractId';
    import { keyId } from '$lib/stores/keyId';
    import diceGameSdk from '$lib/contracts/diceGameContract';

    import type { PageData } from './$types';
    import { account, send } from '$lib/passkeyClient';
    export let data: PageData;

    const toastStore = getToastStore();

    let qrDataUrl = qrCode.toDataURL($page.url.href.replace('manage', 'play'), {
        errorCorrectionLevel: 'high'
    })

    let isWaiting: boolean = false

    $: isButtonDisabled = !$contractId || isWaiting

    async function callIt() {
        console.log('calling it a day')
        try {
            isWaiting = true
            const at = await diceGameSdk.call_it();

            await account.sign(at, { keyId: $keyId })
            await send(at.built!);

            toastStore.trigger({
                message: 'Hooray! Everyone is a winner, now! I\'ll start handing out the participation trophies.',
                background: 'variant-filled-primary'
            })
        } catch (err) {
            console.log('err', err)
            toastStore.trigger({
                message: 'Something went wrong ending the game. Please try again later.',
                background: 'variant-filled-error'
            });
        } finally {
            isWaiting = false;
        }
    }
</script>

<h1 class="h1">Manage Game</h1>
<p>Managing game <code>{data.gameAddress}</code></p>
<div id="container"></div>

{#await qrDataUrl then url}
    <img src={url} alt="qr code to play this game" />
{/await}

<p>Is this taking too long? Click the button below, and then everybody is a winner!</p>
<button class="btn variant-filled-primary" disabled={isButtonDisabled} on:click={callIt}>Call it!</button>
