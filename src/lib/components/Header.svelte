<script lang="ts">
    import LoginButtons from '$lib/components/LoginButtons.svelte';
</script>

<header class="bg-surface-100-900 shadow-xl p-4 z-5">
    <div class="flex justify-between">
        <div class="flex items-center">
            <a class="link" href="/" title="Meridian Roller Home">
                <span class="text-xl"><strong>Meridian Roller</strong></span>
            </a>
        </div>
        <div class="flex gap-4">
            <LoginButtons />
        </div>
    </div>
</header>
