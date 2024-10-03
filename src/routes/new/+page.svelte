<script lang="ts">
    import OddsAlert from '$lib/components/OddsAlert.svelte';

    import { getToastStore } from '@skeletonlabs/skeleton';
    import type { PageData } from './$types';
    import { contractId } from '$lib/stores/contractId';
    import { keyId } from '$lib/stores/keyId';
    import { PUBLIC_NATIVE_CONTRACT_ADDRESS, PUBLIC_GAME_WASM_HASH, PUBLIC_DEPLOYER_CONTRACT_ADDRESS, PUBLIC_STELLAR_NETWORK_PASSPHRASE } from '$env/static/public';
    import { account, send, getSalt, mockSource, native, rpc } from '$lib/passkeyClient';
    import { assembleTransaction } from '@stellar/stellar-sdk/rpc';
    import deployerSdk from '$lib/contracts/deployerContract'
    import { nativeToScVal, Operation, Contract, xdr, Address, TransactionBuilder, BASE_FEE, Transaction } from '@stellar/stellar-sdk';
    import { Spec } from '@stellar/stellar-sdk/contract';
    import { spec } from '$lib/contracts/diceGameContract'
    // import { randomBytes } from 'crypto';

    export let data: PageData;

    const toastStore = getToastStore();

    let numDice: number = 3;
    let numFaces: 4 | 6 | 8 | 10 | 12 | 20;
    let isWaiting: boolean = false;

    $: rollButtonDisabled = isWaiting || !$contractId;

    // let getClassOf = Function.prototype.call.bind(Object.prototype.toString());

    async function deployGame() {
        console.log('deploying game')
        try {
            isWaiting = true;
            // let salt = await getSalt();

            // const args = spec.funcArgsToScVals('init', {
            //     admin: $contractId,
            //     token_address: PUBLIC_NATIVE_CONTRACT_ADDRESS,
            //     num_faces: 6,
            // })
            // console.log('args', args[1].toXDR('base64'))

            const at = await deployerSdk.deploy({
                deployer: $contractId,
                wasm_hash: Buffer.from(PUBLIC_GAME_WASM_HASH, 'hex'),
                salt: Buffer.from(await getSalt(), 'hex'),
                init_fn: 'init',
                init_args: [
                    // ...deployerSdk.spec.funcArgsToScVals('init', {
                    //     admin: $contractId,
                    //     token_address: PUBLIC_NATIVE_CONTRACT_ADDRESS,
                    //     num_faces: 6,
                    // }),
                    // {address: $contractId},
                    // {$contractId: xdr.ScSpecType.scSpecTypeAddress()},
                    // { address: PUBLIC_NATIVE_CONTRACT_ADDRESS },
                    // { u32: numFaces },
                ],
            })
            // const at = xdr.ScSpecType.scSpecTypeU32().value
            // console.log('spec', spec.getFunc('init'))
            // console.log('yas', spec.funcArgsToScVals('init', {
            //     admin: $contractId,
            //     token_address: PUBLIC_NATIVE_CONTRACT_ADDRESS,
            //     num_faces: 6,
            // }))

            // const deployerContract = new Contract(PUBLIC_DEPLOYER_CONTRACT_ADDRESS);
            // const swAddress = new Address($contractId);
            // const tx = new TransactionBuilder(
            //     mockSource, {
            //         fee: BASE_FEE,
            //         networkPassphrase: PUBLIC_STELLAR_NETWORK_PASSPHRASE,
            //     })
            //     .addOperation(Operation.invokeContractFunction({
            //         contract: PUBLIC_DEPLOYER_CONTRACT_ADDRESS,
            //         function: 'deploy',
            //         args: [
            //             swAddress.toScVal(),
            //             nativeToScVal(Buffer.from(PUBLIC_GAME_WASM_HASH, 'hex'), { type: 'bytes'}),
            //             nativeToScVal(Buffer.from(await getSalt(), 'hex'), { type: 'bytes' }),
            //             nativeToScVal('init', { type: 'symbol' }),
            //             nativeToScVal([
            //                 swAddress.toScVal(),
            //                 new Address(PUBLIC_NATIVE_CONTRACT_ADDRESS).toScVal(),
            //                 nativeToScVal(numFaces, { type: 'u32'})
            //             ], { type: 'vector' })
            //         ]
            //     }))
            //     .setTimeout(300)
            //     .build()

            // console.log('tx', tx)
            // console.log('tx instanceof Transaction', tx instanceof Transaction)
            // const sim = await rpc.simulateTransaction(tx) // this works
            // console.log('tx instanceof Transaction', tx instanceof Transaction)
            // const at = assembleTransaction(tx, sim)

            // const pt = await rpc.prepareTransaction(tx) // this doesn't?
            // const tb = TransactionBuilder.cloneFrom(tx);
            // console.log('tb', tb)
            // console.log('at', at)

            // console.log('at', at)
            await account.sign(at, { keyId: $keyId });
            console.log('xdr', at.built?.toXDR())

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
