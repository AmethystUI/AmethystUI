<!-- Note: this should take on the shape of a general input field, with title and everything -->

<script lang="ts">
    export let name:string;
    export let typeface: typographyStyle;
    export let hasMargin: boolean;
    export let minWidth: string = "";
    export let sub: boolean;
    export let alignTitle: string = "left";
    export let widthGrowPerc = 0;

    import { createEventDispatcher, onMount } from 'svelte';
    import flipAnimate from '../../../../util/flipAnimate';
    import { mainFontPickerData } from '../../../../stores/fontPickerManager';
    import Title from '../Basics/Title.svelte';
    import { keepOpenOverlay } from '../../../dynamicOverlay/OverlayBase.svelte';
    
    const disp = createEventDispatcher();
    
    let inputText: HTMLParagraphElement;
    let searchIcon: HTMLImageElement;
    let dispatchLocked = true;
    
    let initialValue: string = typeface.fontObj.appearedName ?? typeface.fontObj.family; // the input will reset to this value if there is nothing, or if there is an error. This must be recorded every time the input is focused.

    const preventNullV = () => {
        const newTypeface:string = typeface.fontObj.appearedName ?? typeface.fontObj.family;
        dispatchLocked = true;
        disp("blurred");

        // hard checking to see if the innerHTML is empty. If it is, replace it with whatever is selected right now.
        if(inputText.textContent.length === 0) inputText.innerHTML = typeface.fontObj.appearedName ?? typeface.fontObj.family;

        // check if the initial value is the same a the new value. If so, nothing is changed and we have to reset the input
        // if(newTypeface === initialValue){
        //     inputText.textContent = initialValue;
        // } else {
        //     initialValue = newTypeface;
        // }
    }

    $: if(!!inputText && $mainFontPickerData.searchLocked) inputText.innerHTML = typeface.fontObj.appearedName ?? typeface.fontObj.family;

    const checkEnterPress = (e:KeyboardEvent) => {
        dispatchLocked = false;
        
        // Check for enter key. If enter is pressed, then blur the search.
        if(e.key === "Enter" || e.key === "Escape" || e.key === "Escape"){
            e.preventDefault();
            inputText.blur();
            disp("blurred");
            return;
        }
    }

    // This function should update the search query when necessary and dispatch back the new query
    $: if(typeface !== null && !dispatchLocked){ // do not send null
        // dispatch value changes if v changes just because why not
        disp("updateValue", {
            v:typeface
        })
    }

    let focused = false;
    const focusInput = () => {        
        flipAnimate(inputText, () => {
            inputText.style.left = "30px";
        }, 300);

        searchIcon.style.opacity = "0.5";

        // select all in the input text if the input is not yet focused
        if(!focused) window.setTimeout(function() {
            let range = document.createRange();
            range.selectNodeContents(inputText);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }, 0);
        
        // dispatch a focsued event
        disp("focused");
    }
    const unFocusInput = () => {
        preventNullV(); // prevent null value input

        // lock the search lock to prevent further input
        $mainFontPickerData.searchLocked = false;

        // deselect all text
        let selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
        }
        
        flipAnimate(inputText, () => {
            inputText.style.removeProperty("left");
            inputText.scrollLeft = 0;
        }, 300);
        searchIcon.style.opacity = "0";
    }

    const updateSearchQuery = () => {
        // disable search lock so we can start entering a new query
        $mainFontPickerData.searchLocked = false;
        $mainFontPickerData.searchQuery = inputText.textContent;
    }
</script>

<main style={`${hasMargin ? "margin-right:6px" : ""}; width:${100+widthGrowPerc}%; ${minWidth !== "" ? `min-width:${minWidth}` : ""}`}>
    <Title name={name} sub={sub} align={alignTitle}/>
    
    <section on:mousedown={() => {setTimeout(() => {inputText.focus()}, 0)}}>
        <!-- Search text -->
        <p bind:this={inputText} class="preview-text" contenteditable={true} spellcheck={false}
        on:keydown={checkEnterPress} on:focus={focusInput} on:blur={unFocusInput} on:mousedown={keepOpenOverlay} on:input={updateSearchQuery}
        style="font-family: '{typeface.fontObj.family}', 'Inter', 'system-ui', 'Tahoma', 'sans-serif'"></p>
        
        <!-- Search icon -->
        <img bind:this={searchIcon} id="search-icon" src="/src/assets/icons/search.svg" alt="">
    </section>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    $input-pad: 7px;

    main{
        section{
            display: flex; align-items: center; justify-content: center;
            position: relative;

            height:25px; width:calc(100% - $input-pad * 2);
            margin:0; padding: 0 $input-pad 0 $input-pad;
            background-color: $primaryl3;
            outline:none; border:none; border-radius: 4px;
            overflow: hidden;
            cursor: text;

            .preview-text{
                font-family: "Inter"; font-weight: 400; font-size: 12px;

                transition-timing-function: $normal-ease-out;

                position: absolute;
                
                outline:none; border:none;
                color: $secondarys2;
                cursor: text;
                white-space: pre; text-overflow: ellipsis;
                max-width: 80%; overflow: hidden;
                margin-bottom: 1px;

                // hide scrollbar
                &::-webkit-scrollbar {
                    display: none;
                }
                -ms-overflow-style: none;  // IE and Edge
                scrollbar-width: none;  // Firefox

                // focused state
                &:focus{
                    overflow: scroll;
                    text-overflow: unset;
                }
            }

            #search-icon{
                transition: 200ms ease opacity;
                filter: invert(1);
                position: absolute;
                left: 9px; margin-top: 2px;
                height: 12px;
                opacity: 0;
            }
        }
    }
</style>