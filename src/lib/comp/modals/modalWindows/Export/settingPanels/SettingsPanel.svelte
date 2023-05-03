<script lang="ts">
    export let panelName = "";

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
    @import "/src/static/stylesheets/guideline";

    main{
        section{
            padding: 0px 10px 10px 10px;
        }

        .header{
            width: 100%; height: fit-content;

            p{
                width: 100%;
                font-size: 20px;
                font-weight: 600;
                letter-spacing: -0.24px;
                padding: 8px 10px 8px 10px;
                background-color: hsla(200, 5%, 8%, 100%);
                backdrop-filter: blur(50px); -webkit-backdrop-filter: blur(50px);
                color: $secondary;
            }
        }
    }
</style>