<script lang="ts">
    export let address: string;
</script>

<span class="flex flex-1 min-w-0 p-1">
    <p class="overflow-hidden text-ellipsis">{address.slice(0, -3)}</p>
    <p>{address.slice(-3)}</p>
</span>
