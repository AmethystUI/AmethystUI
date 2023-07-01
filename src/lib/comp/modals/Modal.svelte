<script lang="ts">
    import { fade } from "svelte/transition";
    import { mainModalData, closeModal as rootCloseModal } from "$src/lib/comp/modals/modalManager";
    import ModalWindow from "./ModalWindow.svelte";
    import ExportModal from "./modalWindows/export/ExportModal.svelte";
    import AppInfoModal from "./modalWindows/appInfo/AppInfoModal.svelte";

    // prevent closing the modal when we drag on something and release outside
    let pressedOnSpace = false;
    const setPressedOnSpace = () => pressedOnSpace = true;
    const closeModal = () => {
        if(pressedOnSpace) rootCloseModal();
        pressedOnSpace = false;
    }
</script>

<main class="no-drag" on:mousedown={setPressedOnSpace} on:click={closeModal} transition:fade={{duration:150}}>
    <!-- I forgot why I needed this line, but if shit breaks and you need it, it's here. -->
    <!-- on:mousedown={e => e.stopPropagation()} -->
    <section on:click={e => e.stopPropagation()}>
        <ModalWindow>
            {#if $mainModalData.windowID === "export"}
                <!-- export modal -->
                <ExportModal />
            {:else if $mainModalData.windowID === "appinfo"}
                <!-- export modal -->
                <AppInfoModal />
            {/if}
        </ModalWindow>
    </section>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    main{
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: none; -webkit-backdrop-filter: blur(2px) brightness(0.7); backdrop-filter: blur(2px) brightness(0.7);
        z-index: 300;
        display: flex; justify-content: center; align-items: center;
    }
</style>