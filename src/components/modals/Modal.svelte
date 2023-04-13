<script lang="ts">
    import { fade } from "svelte/transition";
    import { closeModal } from "../../stores/modalManager";
    import ModalWindow from "./ModalWindow.svelte";

</script>

<main on:mouseup={closeModal} transition:fade={{duration:150}}>
    <section on:mouseup={e => e.stopPropagation()}>
        <ModalWindow>
            <h1>Hi</h1>
        </ModalWindow>
    </section>
</main>

<style lang="scss">
    @import "public/guideline";
    main{
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: none; -webkit-backdrop-filter: blur(2px) brightness(0.7); backdrop-filter: blur(2px) brightness(0.7);
        z-index: 10000;
        display: flex; justify-content: center; align-items: center;
    }
</style>