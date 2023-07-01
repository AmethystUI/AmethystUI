<script lang="ts">
    import { fade } from "svelte/transition";
    import { overlayClosable, closeOverlay as rootCloseOverlay } from "./overlayManager";
    import ProgressOverlay from "./overlayWindows/progress/ProgressOverlay.svelte";

    const closeOverlay = async () => {
        if($overlayClosable){
            rootCloseOverlay();
        }
    }
</script>

<main transition:fade={{duration:200}} on:click={closeOverlay}>
    <!-- I forgot why I needed this line, but if shit breaks and you need it, it's here. -->
    <!-- on:mousedown={e => e.stopPropagation()} -->
    <section on:click={e => e.stopPropagation()}>
        <!-- TODO: Add overlay detection -->
        <ProgressOverlay />
    </section>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    main{
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: none; -webkit-backdrop-filter: blur(50px) brightness(0.7); backdrop-filter: blur(50px) brightness(0.7);
        z-index: 301;
        display: flex; justify-content: center; align-items: center;
    }
</style>