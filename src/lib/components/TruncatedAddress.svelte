<script lang="ts">
    let { text, startChars = 4, endChars = 4 } = $props();

    let shortenedText = `${text.slice(0, startChars)}...${text.slice(endChars * -1)}`
</script>

<span>{shortenedText}</span>
