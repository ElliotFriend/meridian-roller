<script lang="ts">
    import { contractAddress } from '$lib/stores/contractAddress';
    import { keyId } from '$lib/stores/keyId';
    import { account, send, fundContract, getContractId } from '$lib/passkeyClient';
    import { getToastStore } from '@skeletonlabs/skeleton';
    let toastStore = getToastStore();

    async function signup() {
        console.log('signing up');
        try {
            const {
                keyId_base64: kid,
                contractId: cid,
                built
            } = await account.createWallet('Meridian Roller', 'High Stakes Roller');

            keyId.set(kid);
            console.log('key id', $keyId);
            contractAddress.set(cid);
            console.log('contract address', $contractAddress);

            await send(built);
            await fundContract($contractAddress);
        } catch (err) {
            console.log('err', err);
            toastStore.trigger({
                message: 'Something went wrong signing up. Please try again later.',
                background: 'variant-filled-error'
            });
        }
    }

    // async function login() {
    //     console.log('logging in');
    //     try {
    //         const { keyId_base64: kid, contractId: cid } = await account.connectWallet({
    //             getContractId
    //         });

    //         keyId.set(kid);
    //         console.log('key id', $keyId);
    //         contractAddress.set(cid);
    //         console.log('contract address', $contractAddress);
    //     } catch (err) {
    //         console.log('err', err);
    //         toastStore.trigger({
    //             message: 'Something went wrong logging in. Please try again later.',
    //             background: 'variant-filled-error'
    //         });
    //     }
    // }

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
            toastStore.trigger({
                message: 'Something went wrong logging out. Please try again later.',
                background: 'variant-filled-error'
            });
        }
    }
</script>

{#if $contractAddress}
    <button type="button" class="btn variant-filled-secondary" on:click={logout}>Logout</button>
{:else}
    <button type="button" class="btn variant-filled-primary" on:click={signup}>Signup</button>
    <!-- <button type="button" class="btn variant-filled-secondary" on:click={() => login()}
        >Login</button
    > -->
{/if}
