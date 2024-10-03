<script lang="ts">
    import { contractId } from '$lib/stores/contractId';
    import { keyId } from '$lib/stores/keyId';
    import { account, send, fundContract, getContractId } from '$lib/passkeyClient';
    import { PUBLIC_SITE_NAME } from '$env/static/public';
    import base64url from 'base64url';
    import { getToastStore } from '@skeletonlabs/skeleton';
    let toastStore = getToastStore();

    async function signup() {
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

    async function login(storedKey?: string) {
        console.log('logging in');
        try {
            const { keyId: kid, contractId: cid } = await account.connectWallet({
                keyId: storedKey,
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

    function logout() {
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
</script>

{#if $contractId}
    <button type="button" class="btn variant-filled-secondary" on:click={logout}
        >Logout</button
    >
{:else}
    <button type="button" class="btn variant-filled-primary" on:click={signup}
        >Signup</button
    >
    <button type="button" class="btn variant-filled-secondary" on:click={() => login()}>Login</button>
{/if}
