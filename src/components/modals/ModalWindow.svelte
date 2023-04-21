<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { closeModal } from "../../stores/modalManager";
    import { quartOut } from "svelte/easing";

</script>

<main in:fly={{y: -70, duration: 500, easing: quartOut, delay: 100}}>
    <slot></slot>
</main>

<style lang="scss">
    @import "public/guideline";
    
    main{
        width: fit-content; height: fit-content;
        background-color: $primaryl1;
        border: 1.5px solid $primaryl3;
        border-radius: 10px;
        padding: 10px;
    }
</style>