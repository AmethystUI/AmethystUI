<script lang="ts" context="module">
    // define menus here so we can edit them from outside of this component
    export let accountItems:menuItem[] = [
        { // spacer
            type : "spacer", title : "", iconSrc : "", desc: "", cta : () => {}
        },{ // div
            type : "title",
            title : "Lemon Foxmere",
            iconSrc : "", desc: "", cta : () => {}
        },
        { // div
            type : "subtitle",
            title : "@lemonfoxmere",
            iconSrc : "", desc: "", cta : () => {}
        },

        { // spacer
            type : "spacer", title : "", iconSrc : "", desc: "", cta : () => {}
        },{ // spacer
            type : "spacer", title : "", iconSrc : "", desc: "", cta : () => {}
        }, { // spacer
            type : "spacer", title : "", iconSrc : "", desc: "", cta : () => {}
        },
        { // div
            type : "reg",
            title : "Account Settings",
            iconSrc : "/src/assets/icons/info-outline.svg",
            desc: "",
            cta : () => {}
        },
        { // ==========
            type : "sep", title : "", cta : () => {}
        },
        { // div
            type : "reg",
            title : "Log Out",
            iconSrc : "/src/assets/icons/arrow-circle-left-outline.svg",
            desc: "",
            cta : () => {}
        },
    ]
</script>

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { canvasStatus } from "$lib/stores/canvasStatus";
    import RegularControl from "./GeneralAppControl/RegularControl.svelte";
    import DropdownControl, { type menuItem } from "./GeneralAppControl/DropdownControl.svelte";
    import type { dropdownStatusType } from "../ctrlMenus/TopMenu.svelte";
    import { openModal } from "$src/lib/comp/modals/modalManager";
  import { startImport } from "$src/lib/util/import/importManager";

    export let dropdownStatus: dropdownStatusType = {
        currentID : "",
        active : false,
    };
    export let openOverlay: () => void;
    export let closeOverlay: (e?: MouseEvent | KeyboardEvent) => void;
    export let keepOpenDropdown: () => void;

    const disp = createEventDispatcher();
    
    let mainContainer:HTMLElement;

    const toggleDropdown = () => {
        disp("toggleDropdown");
    };
    const updateCurrentID = (evt:CustomEvent<any>) => {
        disp("updateCurrentID", evt.detail);
    };
    
    const toggleCanvasApperance = () => {
        $canvasStatus.darkCanvas = !$canvasStatus.darkCanvas;
    }

    $: if(!!mainContainer){
        disp("widthChange", {
            width: mainContainer.getBoundingClientRect().width + 100
        })
    }
</script>

<!-- HTML -->
<main bind:this={mainContainer}>
    <!-- TODO: contact server later to get pfp and do account verificatino -->
    <!-- <DropdownControl alt="My Account" id="accountConfig" items={accountItems} {...dropdownStatus} on:openDropdown={openOverlay} on:closeDropdown={() => closeOverlay()} on:keepOpenDropdown={keepOpenDropdown} on:updateCurrentID={updateCurrentID} evenSpacing={true} showArrow={false} showHoverEffect={false}>
        <img id="pfp" src="/src/assets/pngs/testpfp.png" alt="">
    </DropdownControl> -->

    <!-- import -->
    <RegularControl imageURI="/src/assets/icons/import-outline.svg" alt="Import" cta={startImport} />

    <!-- export -->
    <RegularControl imageURI="/src/assets/icons/share-outline.svg" alt="Export" cta={() => openModal("export")} />

    <!-- full screen -->
    <!-- <RegularControl imageURI="/src/assets/icons/expand.svg" alt="Checklist" /> -->

    <!-- toggle light & dark mode -->
    <RegularControl
        imageURI="/src/assets/icons/{$canvasStatus.darkCanvas ? "sun" : "moon"}.svg"
        alt="Use {$canvasStatus.darkCanvas ? "light" : "dark"} canvas"
        cta={toggleCanvasApperance}/>

    <!-- spacer -->
    <div style="width:10px"></div>

    <!-- zoom control -->
    <!-- <ZoomControl /> -->
</main>

<!-- STYLE -->
<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    
    main{
        position: absolute; top:0; right:0;
        height: 100%; min-width: fit-content;
        background: none;
        display: flex; flex-direction: row-reverse; justify-content: center; align-items: center;
        padding-right: 20px;
    
        img{
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            cursor: pointer;
        }
        
        #pfp{
            height:32px;
            border-radius: 100px;
        }
    }
</style>