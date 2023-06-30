<script lang="ts">
    import { fade } from "svelte/transition";
    import { closeModal as rootCloseModal } from "$src/lib/comp/modals/modalManager";
    import ProgressOverlay from "./overlayWindows/progress/ProgressOverlay.svelte";

    // prevent closing the modal when we drag on something and release outside
    let pressedOnSpace = false;
    const setPressedOnSpace = () => pressedOnSpace = true;
    const closeModal = () => {
        if(pressedOnSpace) rootCloseModal();
        pressedOnSpace = false;
    }
</script>

<main transition:fade={{duration:200}}>
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