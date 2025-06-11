<script lang="ts">
    import { contractAddress } from '$lib/stores/contractAddress';
    import { keyId } from '$lib/stores/keyId';
    import { account, send, fundContract, getContractId } from '$lib/passkeyClient';
    import { onMount } from 'svelte';

    import { toaster } from '$lib/toaster';

    onMount(async () => {
        if ($keyId) {
            const { contractId } = await account.connectWallet({
                keyId: $keyId
            });

            contractAddress.set(contractId);
        }
    });

    async function signup() {
        console.log('signing up');
        try {
            const {
                keyIdBase64: kid,
                contractId: cid,
                signedTx
            } = await account.createWallet('Meridian Roller', 'High Stakes Roller');

            keyId.set(kid);
            console.log('key id', $keyId);
            contractAddress.set(cid);
            console.log('contract address', $contractAddress);

            await send(signedTx);
            await fundContract($contractAddress);
        } catch (err) {
            console.log('err', err);
            toaster.error({
                description: 'Something went wrong signing up. Please try again later.',
            });
        }
    }

    async function login() {
        console.log('logging in');
        try {
            const { keyIdBase64: kid, contractId: cid } = await account.connectWallet({
                getContractId
            });

            keyId.set(kid);
            console.log('key id', $keyId);
            contractAddress.set(cid);
            console.log('contract address', $contractAddress);
        } catch (err) {
            console.log('err', err);
            toaster.error({
                description: 'Something went wrong logging in. Please try again later.',
            });
        }
    }

    function logout() {
        console.log('logging out');
        try {
            keyId.reset();
            contractAddress.reset();
            localStorage.removeItem('mr:keyId');
            localStorage.removeItem('mr:contractAddress');
            window.location.reload();
        } catch (err) {
            console.log('err', err);
            toaster.error({
                description: 'Something went wrong logging out. Please try again later.',
            });
        }
    }
</script>

{#if $contractAddress}
    <button type="button" class="btn preset-filled-secondary-500" onclick={logout}>Logout</button>
{:else}
    <button type="button" class="btn preset-filled-primary-500" onclick={signup}>Signup</button>
    <button type="button" class="btn preset-filled-secondary-500" onclick={login}>Login</button>
{/if}
