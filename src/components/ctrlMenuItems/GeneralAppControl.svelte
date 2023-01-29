<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import RegularControl from "./GeneralAppControl/RegularControl.svelte";
    import ZoomControl from "./GeneralAppControl/ZoomControl.svelte";
    const disp = createEventDispatcher();
    
    export let dropdownStatus = {
        currentID : "",
        active : false,
    }

    let mainContainer:HTMLElement;

    const toggleDropdown = () => {
        disp("toggleDropdown");
    };
    const updateCurrentID = (evt:CustomEvent<any>) => {
        disp("updateCurrentID", evt.detail);
    };
    

    $: if(!!mainContainer){
        disp("widthChange", {
            width: mainContainer.getBoundingClientRect().width + 100
        })
    }
</script>

<!-- HTML -->
<main bind:this={mainContainer}>
    <!-- TODO: contact server later to get pfp -->
    <img id="pfp" src="./assets/pngs/testpfp.png" alt="">

    <!-- export -->
    <RegularControl imageURI="./assets/icons/share.svg" alt="Export" />

    <!-- check list -->
    <RegularControl imageURI="./assets/icons/expand.svg" alt="Checklist" />

    <!-- toggle light & dark mode -->
    <RegularControl imageURI="./assets/icons/sun.svg" alt="Toggle dark mode" />

    <!-- spacer -->
    <div style="width:10px"></div>

    <!-- zoom control -->
    <ZoomControl />
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../../../public/guideline";
    
    main{
        position: absolute; top:0; right:0;
        height: 100%; min-width: fit-content;
        background: none;
        display: flex; flex-direction: row-reverse; justify-content: center; align-items: center;
        padding-right: 45px;
    
        img{
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            cursor: pointer;
        }
        
        #pfp{
            height:32px;
            border-radius: 100px;
            margin-left: 17px;
        }

        .spacer{
            height:100%;
            width:15px;
        }


    }
</style>