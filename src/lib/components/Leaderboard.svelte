<script lang="ts">
    import { DataHandler } from '@vincjo/datatables'
    import { source } from 'sveltekit-sse';
    import { page } from '$app/stores';
    import type { Readable } from 'svelte/store';

    let value: Readable<Record<string, any> | null> = source(`/api/game/${$page.params.address}/events`).select('leaderboard').json()
    $: leaderboard = $value ? Object.entries($value)
        .map(([key, value]) => {
            return {
                rolled: value.rolled,
                address: key,
                ledger: value.ledger,
            }
        })
        .sort((a, b) => b.rolled - a.rolled) : []

    $: handler = new DataHandler(leaderboard, { rowsPerPage: 5 })
    $: rows = handler.getRows();
</script>

<div class="table-container space-y-4">
    <table class="table table-hover table-compact table-auto w-full">
        <thead>
            <tr>
                <th>Rolled</th>
                <th>Address</th>
                <th>Ledger</th>
            </tr>
        </thead>
        <tbody>
            {#each $rows as row}
                <tr>
                    <td>{row.rolled}</td>
                    <td><code>{row.address}</code></td>
                    <td>{row.ledger}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
