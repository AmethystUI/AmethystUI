
<script lang="ts">
    import type { elementStyle } from "$lib/types/element";

    export let currentStyle: elementStyle;
</script>

<!-- Raw text content -->
{#if currentStyle.USETEXT}
    <!-- simulate leading and trailing content -->
    {#each (currentStyle.leadingContent + currentStyle.trailingContent).split("\n") as line}
        {line}
        <br>
    {/each}
{/if}