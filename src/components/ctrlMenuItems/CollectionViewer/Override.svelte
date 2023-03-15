<script lang="ts">
    import { fly } from "svelte/transition";
    import { collection, focusedComponent, selectedComponent, selectedOverride, focusedOverride, layerDeleteLock, layerBlurLock } from "../../../stores/collection";
    import { createEventDispatcher } from 'svelte';
    import { setSelectedElmnt } from "../../../stores/overlayStat";

    export let height:number;
    export let elmntIndex:number;
    export let overrideIndex:number;
    
    let editable = false;
    let nameField:HTMLParagraphElement;
    let nameFieldContainer:HTMLElement;

    const focusOverride = () => {
        // turn on blur lock
        $layerBlurLock = true;
        
        // switch focus to override index, and selected override to a non -1 value
        $selectedComponent = elmntIndex;
        $selectedOverride = overrideIndex;
        $focusedComponent = -1;
        $focusedOverride = overrideIndex;

        // update the elemnt number for color picker
        setSelectedElmnt($selectedComponent, $selectedOverride);
    }

    const setEditableTrue = () => {
        editable=true;
        if(!!nameField){
            // set focus to it
            setTimeout(() => {
                nameField.focus();
            }, 0);
        }

        // select all in the input text
        window.setTimeout(function() {
            let range = document.createRange();
            range.selectNodeContents(nameField);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }, 0);
    }

    const checkKeyPress = (e:KeyboardEvent):void =>{
        if(e.key === "Enter" || e.key === "Escape"){
            e.preventDefault();

            // format the name properly by removing redundant spaces, replacing the spaces with dashes, lower casing all letters, and removing any characters that's not a number or a letter (any symbols or punctuations).
            if (!!$collection[elmntIndex]?.styleOverrides[overrideIndex]) {
                let name = nameField.textContent
                    .replace(/[^a-zA-Z0-9\s+\-]/g, "") // remove any non-alphanumeric characters
                    .replace(/\-/g, " ") // replace dashes with spaces so we can clear stray dashes
                    .trim() // trim spaces / dashes
                    .replace(/\s+/g, "-") // replace multiple spaces with single dash
                
                // check to see if name is empty or if the escape key is pressed instead of the enter key.
                if(name.length === 0 || e.key === "Escape"){
                    name = $collection[elmntIndex]?.styleOverrides[overrideIndex].name; // reset to last working one.
                }

                // Check if it's a duplicate name, make sure to ignore self.
                if($collection[elmntIndex]?.styleOverrides.map(ov => ov.name).indexOf(name) !== -1 && name !== $collection[elmntIndex]?.styleOverrides[overrideIndex].name){
                    const animation = nameFieldContainer.animate([
                        { transform: 'translateX(0px)' },
                        { transform: 'translateX(-5px)' },
                        { transform: 'translateX(5px)' },
                        { transform: 'translateX(0px)' }
                    ], {
                        duration: 300,
                        easing: 'ease-out',
                        iterations: 1
                    });

                    animation.play();
                    
                    return;
                }
        
                // set final name
                $collection[elmntIndex].styleOverrides[overrideIndex].name = name;
                nameField.textContent = name;

                nameField.blur();
            }

            return;
        }
    };

    const changeName = (e:Event):void => {
        let name = nameField.textContent
            .replace(/[^a-zA-Z0-9\s+\-]/g, "") // remove any non-alphanumeric characters
            .replace(/\-/g, " ") // replace dashes with spaces so we can clear stray dashes
            .trim() // trim spaces / dashes
            .replace(/\s+/g, "-") // replace multiple spaces with single dash

        if($collection[elmntIndex]?.styleOverrides.map(ov => ov.name).indexOf(name) !== -1 && name !== $collection[elmntIndex]?.styleOverrides[overrideIndex].name){
            name = $collection[elmntIndex]?.styleOverrides[overrideIndex].name; // reset name
        }

        $collection[elmntIndex].styleOverrides[overrideIndex].name = name; // change value in the store
        nameField.textContent = name; // update the text in the input field
        $collection = $collection;
    }

    $: if(!!nameField) nameField.textContent = $collection[elmntIndex]?.styleOverrides[overrideIndex]?.name ?? "";

    $: $layerDeleteLock = editable // lock delete
</script>

<main bind:this={nameFieldContainer} class={`
    layer ${$selectedOverride === overrideIndex && $selectedComponent === elmntIndex ? "selected" : ""} ${$focusedOverride !== overrideIndex && $selectedOverride === overrideIndex && $selectedComponent === elmntIndex ? "blurred" : ""}`} on:mousedown={focusOverride} style="min-height: {height}px;" in:fly={{y:-10, duration:300}}
    on:dblclick={setEditableTrue}>
    <!-- icon + title -->
    <img src="./assets/icons/copy.svg" alt="">

    <p bind:this={nameField} contenteditable={editable} class={`${editable ? "editable" : ""}`} style={`cursor: ${editable ? "text" : "normal"}`} on:blur={() => {editable=false; nameField.scrollLeft = 0}} on:keypress={checkKeyPress} on:blur={changeName}>
        {$collection[elmntIndex]?.styleOverrides[overrideIndex]?.name ?? ""}
    </p>
</main>

<style lang="scss">
    @import "../../../../public/guideline";

    main{
        min-width: calc(100% - 10px);
        border-radius: 6px;
        display: flex; align-items: center;
        margin: 0px;
        cursor:pointer;
        transition: background-color 100ms ease;
        margin-bottom:10px;

        &:hover{
            background-color: hsla(0,0%,100%,7%);
        }

        img{
            transition: 200ms filter ease;
            filter: invert(1); opacity: 0.5;
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
            height: 18px;
            margin: 0px 10px 0px 10px;
        }

        p{
            font-size: 14px;
            font-variation-settings: "wght" 400;
            color: $secondarys2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: calc(100% - 50px);
            outline: none;

            &.editable{
                overflow:scroll;
                text-overflow: clip !important;
            }
        
            &:focus{
                max-width: calc(100vw - 350px) !important;
                overflow: scroll; text-overflow: clip;
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            } &::-webkit-scrollbar {
                display: none;
            }
        }
    }

    .selected{
        background-color: $accent !important;

        img{
            filter: invert(1); opacity: 1;
        }
        p{
            color: $secondary;
            // text-shadow: 0 0 20pt hsl(0,0%,0%);
        }
    }

    .blurred{
        background-color: $accents3 !important;
    }
</style>