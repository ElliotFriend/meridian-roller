<script lang="ts">
    import { page } from '$app/stores';
    import type { PageData } from './$types';
    export let data: PageData;

    import qrCode from 'qrcode'
    let qrDataUrl = qrCode.toDataURL($page.url.href.replace('manage', 'play'), {
        errorCorrectionLevel: 'high'
    })
</script>

<h1 class="h1">Manage Game</h1>
<p>Managing game <code>{data.gameAddress}</code></p>
<div id="container"></div>

{#await qrDataUrl then url}
    <img src={url} alt="qr code to play this game" />
{/await}
