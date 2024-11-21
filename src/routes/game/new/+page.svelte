<script lang="ts">
    import OddsAlert from '$lib/components/OddsAlert.svelte';

    import { goto } from '$app/navigation';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { contractAddress } from '$lib/stores/contractAddress';
    import { keyId } from '$lib/stores/keyId';
    import { PUBLIC_NATIVE_CONTRACT_ADDRESS, PUBLIC_GAME_WASM_HASH } from '$env/static/public';
    import { account, send, getSalt } from '$lib/passkeyClient';
    import { scValToNative, xdr } from '@stellar/stellar-sdk';
    import deployerSdk from '$lib/contracts/deployerContract';
    import diceGameSdk from '$lib/contracts/diceGameContract';

    const toastStore = getToastStore();

    let numDice: number = 3;
    let numFaces: 2 | 3 | 4 | 6 | 8 | 10 | 12 | 20;
    let tokenAddress: string = PUBLIC_NATIVE_CONTRACT_ADDRESS;
    let isWaiting: boolean = false;

    $: rollButtonDisabled = isWaiting || !$contractAddress;

    async function deployGame() {
        console.log('deploying game');
        try {
            isWaiting = true;
            const at = await deployerSdk.deploy({
                deployer: $contractAddress,
                wasm_hash: Buffer.from(PUBLIC_GAME_WASM_HASH, 'hex'),
                salt: Buffer.from(await getSalt(), 'hex'),
                init_fn: 'init',
                init_args: [
                    ...diceGameSdk.spec.funcArgsToScVals('init', {
                        admin: $contractAddress,
                        token_address: PUBLIC_NATIVE_CONTRACT_ADDRESS,
                        num_faces: parseInt(numFaces.toString())
                    })
                ]
            });

            console.log('at', at.built?.toXDR());

            const tx = await account.sign(at.built!, { keyId: $keyId });
            const res = await send(tx.built!);

            const result = xdr.TransactionMeta.fromXDR(res.resultMetaXdr, 'base64');
            const sMeta = result.v3().sorobanMeta();
            let deployedGame;
            if (sMeta) {
                deployedGame = scValToNative(sMeta.returnValue())[0];
            }

            toastStore.trigger({
                message: `Amazing! You've created a brand new game. The contract address is <code>${deployedGame}</code>.`,
                background: 'variant-filled-success'
            });

            goto(`./${deployedGame}/manage`);
        } catch (err) {
            console.error('err', err);
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
<p>
    Choose which token you'd like to use, and configure the dice you'd like to be rolled in your
    game below.
</p>

<form on:submit|preventDefault class="space-y-4">
    <label class="label">
        <span
            >Specify how many dice should be rolled (currently, it can only be 3. sorry 'bout that)</span
        >
        <input class="input" type="number" bind:value={numDice} placeholder="3" readonly />
    </label>
    <label class="label">
        <span>Select the number of faces on those dice</span>
        <select class="select" bind:value={numFaces}>
            <option>2</option>
            <option>3</option>
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
        <select class="select" bind:value={tokenAddress}>
            <option value={PUBLIC_NATIVE_CONTRACT_ADDRESS}>XLM</option>
            <option value="CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA" disabled
                >USDC</option
            >
        </select>
    </label>
    <button class="btn variant-filled-primary" disabled={rollButtonDisabled} on:click={deployGame}
        >Create Game</button
    >
</form>
