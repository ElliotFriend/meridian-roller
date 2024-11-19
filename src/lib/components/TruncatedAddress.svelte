<script lang="ts">
    export let address: string;
</script>

<span class="flex flex-1 min-w-0 p-0">
    <p class="p-0 overflow-hidden text-ellipsis">{address.slice(0, -3)}</p>
    <p class="p-0">{address.slice(-3)}</p>
</span>
