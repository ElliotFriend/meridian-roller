<script lang="ts">
    import OddsAlert from '$lib/components/OddsAlert.svelte';

    import { getToastStore } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';
    import { contractId } from '$lib/stores/contractId';
    import { keyId } from '$lib/stores/keyId';
    import { PUBLIC_NATIVE_CONTRACT_ADDRESS, PUBLIC_GAME_WASM_HASH, PUBLIC_DEPLOYER_CONTRACT_ADDRESS } from '$env/static/public';
    import { account, send, getSalt } from '$lib/passkeyClient';
    import deployerSdk from '$lib/contracts/deployerContract'
    import { nativeToScVal } from '@stellar/stellar-sdk';
    // import { randomBytes } from 'crypto';

    export let data: PageData;

    const toastStore = getToastStore();

    let numDice: number = 3;
    let numFaces: 4 | 6 | 8 | 10 | 12 | 20;
    let isWaiting: boolean = false;

    $: rollButtonDisabled = isWaiting || !$contractId;

    async function deployGame() {
        console.log('deploying game')
        try {
            isWaiting = true;
            // let salt = await getSalt();
            const at = await deployerSdk.deploy({
                deployer: $contractId,
                wasm_hash: Buffer.from(PUBLIC_GAME_WASM_HASH, 'hex'),
                init_fn: 'init',
                salt: Buffer.from(await getSalt(), 'hex'),
                init_args: [
                    nativeToScVal([
                        $contractId,
                        nativeToScVal(PUBLIC_NATIVE_CONTRACT_ADDRESS, { type: 'address' }),
                        numFaces,
                    ], { type: 'vector' }),
                ]
            })

            console.log('at', at)
            await account.sign(at, { keyId: $keyId });
            const res = await send(at.built!);

            console.log('res', res);

        } catch (err) {
            console.error('err', err)
            toastStore.trigger({
                message: 'Something went wrong rolling dice. Please try again later.',
                background: 'variant-filled-error'
            });
        } finally {
            isWaiting = false;
        }
    }
</script>

<h1 class="h1">Start a new game</h1>
<p>Choose which token you'd like to use, and configure the dice you'd like to be rolled in your game below.</p>

<form on:submit|preventDefault class="space-y-4">
    <label class="label">
        <span>Specify how many dice should be rolled (currently, it can only be 3. sorry 'bout that)</span>
        <input class="input" type="number" bind:value={numDice} placeholder="3" readonly />
    </label>
    <label class="label">
        <span>Select the number of faces on those dice</span>
        <select class="select" bind:value={numFaces}>
            <option>4</option>
            <option selected>6</option>
            <option>8</option>
            <option>10</option>
            <option>12</option>
            <option>20</option>
        </select>
    </label>

    <OddsAlert {numDice} {numFaces} />

    <label class="label">
        <span>Select the payment token</span>
        <select class="select">
            <option value={PUBLIC_NATIVE_CONTRACT_ADDRESS} selected>XLM</option>
            <option value="CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA" disabled>USDC</option>
        </select>
    </label>
    <button class="btn variant-filled-primary" disabled={rollButtonDisabled} on:click={deployGame}>Create Game</button>
</form>
