<script lang="ts">
    import d20 from '$lib/assets/d20.svg';
    import { getToastStore } from '@skeletonlabs/skeleton';
    import { contractId } from '$lib/stores/contractId';
    import { keyId } from '$lib/stores/keyId';
    import { account, send, fundContract, getContractId, native } from '$lib/passkeyClient';
    import { PUBLIC_SITE_NAME, PUBLIC_GAME_CONTRACT_ADDRESS } from '$env/static/public';
    import base64url from 'base64url';
    import diceGame from '$lib/contracts/diceGameContract';
    import { xdr, scValToNative } from '@stellar/stellar-sdk';
    import DieRoll from '$lib/components/DieRoll.svelte';

    let rollResult: number[];
    let isWaiting: boolean = false;

    const toastStore = getToastStore();

    const signup = async () => {
        console.log('signing up');
        try {
            const {
                keyId: kid,
                contractId: cid,
                built
            } = await account.createWallet(PUBLIC_SITE_NAME, 'High Stakes Roller');

            const keyId_b64 = base64url(kid);
            keyId.set(keyId_b64);
            console.log('key id', keyId_b64);
            contractId.set(cid);
            console.log('contract id', cid);

            await send(built);
            await fundContract($contractId);
        } catch (err) {
            console.log('err', err);
            toastStore.trigger({
                message: 'Something went wrong signing up. Please try again later.',
                background: 'variant-filled-error'
            });
        }
    };

    const login = async () => {
        console.log('logging in');
        try {
            const { keyId: kid, contractId: cid } = await account.connectWallet({
                getContractId
            });

            const keyId_base64 = base64url(kid);
            keyId.set(keyId_base64);
            console.log('key id', $keyId);

            contractId.set(cid);
            console.log('contract id', $contractId);
        } catch (err) {
            console.log('err', err);
            toastStore.trigger({
                message: 'Something went wrong logging in. Please try again later.',
                background: 'variant-filled-error'
            });
        }
    };

    const logout = async () => {
        console.log('logging out');
        try {
            keyId.reset();
            contractId.set('');
            localStorage.removeItem('dg:keyId');
            window.location.reload();
        } catch (err) {
            console.log('err', err);
            toastStore.trigger({
                message: 'Something went wrong logging out. Please try again later.',
                background: 'variant-filled-error'
            });
        }
    };

    const rollDice = async () => {
        console.log('rolling dice');
        try {
            isWaiting = true;
            const at = await diceGame.roll({
                roller: $contractId
            });

            await account.sign(at, { keyId: $keyId });
            console.log('at', at.built!.toXDR());
            const res = await send(at.built!);
            console.log('res', res);

            let result = xdr.TransactionMeta.fromXDR(res.resultMetaXdr, 'base64');
            // @ts-ignore
            rollResult = scValToNative(result.value().sorobanMeta().returnValue());
            // console.log(result)

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

<div class="container h-full mx-auto flex justify-center items-center">
    <div class="space-y-5">
        <h1 class="h1">Let's get cracking bones!</h1>
        <p>Start by exploring:</p>
        <ul>
            <li><code class="code">/src/routes/+layout.svelte</code> - barebones layout</li>
            <li><code class="code">/src/app.postcss</code> - app wide css</li>
            <li>
                <code class="code">/src/routes/+page.svelte</code> - this page, you can replace the contents
            </li>
        </ul>
        {#if $contractId}
            <button
                type="button"
                class="btn variant-filled-primary"
                on:click={rollDice}
                disabled={isWaiting}>Roll!</button
            >
            <button type="button" class="btn variant-filled-secondary" on:click={logout}
                >Logout</button
            >
        {:else}
            <button type="button" class="btn variant-filled-primary" on:click={login}>Login</button>
            <button type="button" class="btn variant-filled-secondary" on:click={signup}
                >Signup</button
            >
        {/if}

        <!-- <D20Roll rolledNumber={20} /> -->

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
    </div>
</div>
