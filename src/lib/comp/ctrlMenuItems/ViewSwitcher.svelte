<script lang="ts">
    import { currentView, type viewTypes } from "$lib/stores/viewingManager";
    import { openModal } from "../modals/modalManager";
    import MultiToggle, { type multiToggleSelection } from "./StyleEditors/Basics/MultiToggle.svelte";

    const viewToggleElements:multiToggleSelection<viewTypes>[] = [
        {
            iconDir : "/src/assets/icons/single-layer.svg",
            val : "element",
            alt : "Elements & Overrides"
        }, {
            iconDir : "/src/assets/icons/layers-horizontal-solid.svg",
            val : "component",
            alt : "Component composition"
        }
    ]

    // updating the view based on the index
    const updateView = (e:CustomEvent) => { // this event also passes back an index. Even though we don't have any use for it now, we might in the future
        const value = e.detail.value;
        // assign value
        currentView.set(value);
    }

    const openAboutApp = () => {
        openModal("appinfo");
    }
</script>

<!-- HTML -->
<main>
    <button on:click={openAboutApp}><img src="/src/assets/svgs/emblem_flat.svg" alt=""></button>
    
    <section>
        <MultiToggle elements={viewToggleElements} selection={0} on:valueChange={updateView}/>
        <div style="width: 10px"></div>
    </section>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    main{
        width:100%; height: 65px;
        display:flex; justify-content: space-between; align-items: center;

        section{
            display: flex; justify-content: center; align-items: center;
        }

        button{
            background: none; border: none; outline: none;
            opacity:0.25;
            transition: opacity 100ms ease;
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;

            img{
                height:26px;
                padding:15px;
                user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            }

            &:hover{
                opacity:0.4;
            }
        }
    }
</style>