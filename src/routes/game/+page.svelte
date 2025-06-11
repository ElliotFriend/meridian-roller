<script lang="ts">
    import { Address, humanizeEvents, scValToNative, StrKey } from "@stellar/stellar-sdk";
import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
    // console.log('data data data', data)
</script>

<h1 class="h1">Recent Games</h1>

<ol class="list">
    <li>
        <span>1.</span>
        <span class="flex-auto">There use to be recent games listed here.</span>
    </li>
    <li>
        <span>2.</span>
        <span class="flex-auto">But it didn't work very well.</span>
    </li>
    <li>
        <span>3.</span>
        <span class="flex-auto">So I gave up on that part for now.</span>
    </li>
</ol>

<div class="table-container">
    <table class="table table-hover">
        <thead>
            <tr>
                <th>Game Address</th>
                <th>Game Owner</th>
                <th>Number of Faces</th>
            </tr>
        </thead>
        <tbody>
            {#each data.events as event}
            <!-- {@const address = event.topic[2].address().contractId() ?? event.topic[2].address().accountId()} -->
                <tr>
                    <td>{event.contractId}</td>
                    <td>{event.admin}</td>
                    <!-- <td>{address}</td> -->
                    <td>{event.numFaces}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
