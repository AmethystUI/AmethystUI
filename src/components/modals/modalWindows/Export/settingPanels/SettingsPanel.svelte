<script lang="ts">
    import { onMount } from "svelte";

    export let panelName = "";

    let showContent = true;
    let panel: HTMLElement;
</script>

<main bind:this={panel}>
    <!-- title -->
    {#if panelName !== ""}
        <div class="header">
            <p class="no-drag">{panelName}</p>
        </div>
    {/if}

    <!-- content -->
    <section>
        <slot></slot>
    </section>
</main>

<style lang="scss">
    @import "public/guideline";

    main{
        section{
            padding: 10px
        }

        .header{
            width: 100%; height: fit-content;

            p{
                width: 100%;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0px;
                padding: 8px 10px 8px 10px;
                background-color: hsla(200, 5%, 8%, 100%);
                backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px);
                color: $secondary;
            }
        }
    }
</style>