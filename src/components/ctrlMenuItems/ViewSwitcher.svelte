<script lang="ts">
    import { currentView } from "../../stores/viewingMode";
    import { get } from "svelte/store";
    import MultiToggle, { multiToggleSelection } from "./StyleEditors/Basics/MultiToggle.svelte";

    const componentUUID = crypto.randomUUID();
    const viewToggleElements:multiToggleSelection<string>[] = [
        {
            iconDir : "./assets/icons/cube.svg",
            val : "edit",
            alt : "Edit"
        }, {
            iconDir : "./assets/icons/pantone.svg",
            val : "palette",
            alt : "Palette"
        }
    ]

    // updating the view based on the index
    const updateView = (e:CustomEvent) => { // this event also passes back an index. Even though we don't have any use for it now, we might in the future
        const value = e.detail.value;
        // assign value
        currentView.set(value);
    }
</script>

<!-- HTML -->
<main>
    <a href="https://google.com"><img src="./assets/svgs/emblem_flat.svg" alt=""></a>
    <MultiToggle elements={viewToggleElements} selection={0} on:valueChange={updateView}/>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../../../public/guideline";

    main{
        width:100%; height: 65px;
        display:flex; justify-content: space-between; align-items: center;

        a{
            opacity:0.2;
            transition: opacity 100ms ease;
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;

            img{
                height:30px;
                padding:15px;
                user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            }

            &:hover{
                opacity:0.4;
            }
        }
    }
</style>