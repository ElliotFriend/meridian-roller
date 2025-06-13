<script lang="ts">
    import OddsAlert from '$lib/components/OddsAlert.svelte';

    import { goto } from '$app/navigation';
    import { contractAddress } from '$lib/stores/contractAddress';
    import { PUBLIC_NATIVE_CONTRACT_ADDRESS } from '$env/static/public';
    import { sendDeploy } from '$lib/passkeyClient';
    import { toaster } from '$lib/toaster';

    import Dices from 'lucide-svelte/icons/dices';

    let numDice: 2 | 3 | 4 | 5;
    let numFaces: 2 | 3 | 4 | 6 | 8 | 10 | 12 | 20;
    let tokenAddress: string = PUBLIC_NATIVE_CONTRACT_ADDRESS;
    let isDeploying: boolean = false;

    $: rollButtonDisabled = isDeploying || !$contractAddress;

    async function deployGame() {
        console.log('deploying game');

        try {
            isDeploying = true;

            const deployedGame = await sendDeploy(
                $contractAddress,
                PUBLIC_NATIVE_CONTRACT_ADDRESS,
                parseInt(numDice.toString()),
                parseInt(numFaces.toString()),
            );

            toaster.success({
                description: `Amazing! You've created a brand new game.`,
            });

            goto(`./${deployedGame}/manage`);
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
        <select class="select" bind:value={numDice}>
            <option>2</option>
            <option selected>3</option>
            <option>4</option>
            <option>5</option>
        </select>
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
    <button
        class="btn preset-filled-primary-500"
        disabled={rollButtonDisabled}
        on:click={deployGame}
    >
        <span><Dices class={isDeploying ? 'animate-spin' : ''} /></span>
        <span>Create Game</span>
    </button>
</form>
