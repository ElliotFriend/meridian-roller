<script lang="ts">
    import type { PageProps } from './$types';
    import TruncatedAddress from '$lib/components/TruncatedAddress.svelte';

    let { data }: PageProps = $props();
</script>

<h1 class="h1">Recent Games</h1>

<ul class="list-inside list-decimal space-y-2">
    <li>There use to be recent games listed here.</li>
    <li>But it didn't work very well.</li>
    <li>So I gave up on that part for now.</li>
</ul>

<div class="table-container">
    <table class="table">
        <thead>
            <tr>
                <th>Game Address</th>
                <th>Game Owner</th>
                <th>Number of Dice</th>
                <th>Number of Faces</th>
            </tr>
        </thead>
        <tbody>
            {#each data.events as event}
                <tr>
                    <td
                        ><a href={`/game/${event.contractId}/play`} class="anchor">
                            <TruncatedAddress
                                text={event.contractId?.toString()}
                                startChars={10}
                                endChars={10}
                            />
                        </a></td
                    >
                    <td><TruncatedAddress text={event.admin} startChars={10} endChars={10} /></td>
                    <td>{event.numDice}</td>
                    <td>{event.numFaces}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
