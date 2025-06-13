<script lang="ts">
    import OddsAlert from '$lib/components/OddsAlert.svelte';

    import { goto } from '$app/navigation';
    import { contractAddress } from '$lib/stores/contractAddress';
    import { keyId } from '$lib/stores/keyId';
    import { PUBLIC_NATIVE_CONTRACT_ADDRESS, PUBLIC_GAME_WASM_HASH, PUBLIC_STELLAR_NETWORK_PASSPHRASE, PUBLIC_STELLAR_RPC_URL } from '$env/static/public';
    import { account, send, getSalt, rpc, sendDeploy, mockPubkey } from '$lib/passkeyClient';
    // import { Address } from '@stellar/stellar-sdk'
    import getSalty, { scValToNative, xdr, contract, Keypair, Networks, TransactionBuilder, Operation, Address, nativeToScVal, authorizeInvocation, authorizeEntry } from '@stellar/stellar-sdk/minimal';
    // import { scValToNative, xdr, contract, Keypair, Networks, TransactionBuilder, Operation, nativeToScVal, authorizeInvocation, authorizeEntry } from 'dice_game';
    // import deployerSdk from '$lib/contracts/deployer';
    import diceGameSdk, { deploy } from '$lib/contracts/dice_game';
    import { Client as DiceDeployer } from 'dice_game';
    import { toaster } from '$lib/toaster';

    import LoaderCircle from 'lucide-svelte/icons/loader-circle';
    import Dices from 'lucide-svelte/icons/dices';
    // import { basicNodeSigner } from '@stellar/stellar-sdk/contract';
    import { assembleTransaction } from '@stellar/stellar-sdk/minimal/rpc';
    import { createDeployAuthEntry, createDeployHostFunction, createDeployHostFunctionAndAuthEntry } from '$lib/utils/deploy';



    let numDice: number = 3;
    let numFaces: 2 | 3 | 4 | 6 | 8 | 10 | 12 | 20;
    let tokenAddress: string = PUBLIC_NATIVE_CONTRACT_ADDRESS;
    let isDeploying: boolean = false;

    $: rollButtonDisabled = isDeploying || !$contractAddress;

    async function deployGame() {
        console.log('deploying game');

        try {
            isDeploying = true;

            /**
             * using the bindings deploy thing results in simulation complaining
             * about non-root auth required and stuff.
             */
            // const at = await DiceDeployer.deploy({
            //     admin: $contractAddress,
            //     token_address: PUBLIC_NATIVE_CONTRACT_ADDRESS,
            //     num_faces: parseInt(numFaces.toString()),
            // }, {
            //     rpcUrl: "https://soroban-testnet.stellar.org",
            //     wasmHash: "c46cfa485acedd6736f345da6f8c1af1414ae67bcae2378cd5e4c25a150a8ab8",
            //     networkPassphrase: "Test SDF Network ; September 2015",
            //     publicKey: mockPubkey,
            //     timeoutInSeconds: 30,
            // })
            // console.log('at', at)

            /**
             * this way of manually constructing the host function operation and auth
             * entry seems to work (mostly? still get some weird `tx_too_soon` errors)
             */
            const adminAddress = new Address($contractAddress)
            const salt = Buffer.from((await getSalt()), 'hex')
            const buff = new ArrayBuffer(8);
            const bigint64 = new BigInt64Array(buff);
            const nonce = crypto.getRandomValues(bigint64)
            console.log('nonce', nonce)

            const { func, auth } = createDeployHostFunctionAndAuthEntry(adminAddress, salt, nonce)
            console.log('func', func.toXDR('base64'))

            let signedAuth = await account.signAuthEntry(auth, { keyId: $keyId })
            console.log('signedAuth', signedAuth.toXDR('base64'))



            const deployedGame = await sendDeploy(func.toXDR('base64'), signedAuth.toXDR('base64'))
            console.log('deployedGame', deployedGame)

            toaster.success({
                description: `Amazing! You've created a brand new game. The contract address is <code>${deployedGame}</code>.`,
            });

            // goto(`./${deployedGame}/manage`);
        } catch (err) {
            console.error('err', err);
            toaster.error({
                description: 'Something went wrong deploying game. Please try again later.',
            });
        } finally {
            isDeploying = false;
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
    <button class="btn preset-filled-primary-500" disabled={rollButtonDisabled} on:click={deployGame}>
        <span><Dices class={isDeploying ? 'animate-spin' : ''} /></span>
        <span>Create Game</span>
    </button>
</form>
