<script lang="ts">
    import '../app.css';
    import { Toaster } from '@skeletonlabs/skeleton-svelte';
    import { toaster } from '$lib/toaster';

    import Header from '$lib/components/Header.svelte';
    import Footer from '$lib/components/Footer.svelte';
</script>

<Toaster {toaster}></Toaster>

<div class="h-screen grid grid-rows-[auto_1fr_auto]">
    <Header />

    <div class="container mx-auto grid grid-cols-1">
        <main class="p-4 space-y-4 md:mt-8">
            <slot />
        </main>
    </div>

    <Footer />
</div>
