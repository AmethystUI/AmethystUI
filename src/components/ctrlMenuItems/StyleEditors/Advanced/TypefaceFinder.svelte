<!-- Note: this should take on the shape of a general input field, with title and everything -->

<script lang="ts">
    export let name:string;
    export let typeface: typographyStyle;
    export let hasMargin: boolean;
    export let minWidth: string = "";
    export let sub: boolean;
    export let alignTitle: string = "left";
    export let widthGrowPerc = 0;

    import { createEventDispatcher } from 'svelte';
    import flipAnimate from '../../../../helpers/flipAnimate';
    import type { typographyStyle } from '../../../../stores/collection';
    import { mainFontPickerData } from '../../../../stores/fontPickerStat';
    import Title from '../Basics/Title.svelte';
    import { keepOpenOverlay } from './Overlay.svelte';
    
    const disp = createEventDispatcher();
    
    let inputText: HTMLParagraphElement;
    let inputTextContainer: HTMLElement;
    let searchIcon: HTMLImageElement;
    let dispatchLocked = true;
    let colorPreviewSquare: HTMLDivElement; // the square that previews the text color
    
    let initialValue: string = typeface.typeface; // the input will reset to this value if there is nothing, or if there is an error. This must be recorded every time the input is focused.

    const preventNullV = () => {
        if (!typeface) typeface.typeface = initialValue;
        dispatchLocked = true;
        disp("blurred");

        // hard checking to see if the innerHTML is empty
        if(inputText.textContent.length === 0) inputText.textContent = initialValue;
    }

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

    // dispatch value changes if v changes
    $: if(typeface !== null && !dispatchLocked){ // do not send null
        disp("updateValue", {
            v:typeface
        })
    }

    let focused = false;
    const focusInput = () => {
        initialValue = inputTextContainer.textContent;
        
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

        // deselect all text
        let selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
        }

        // clear search query in fontPickDat.
        $mainFontPickerData.searchQuery = "";
        
        flipAnimate(inputText, () => {
            inputText.style.removeProperty("left");
            inputText.scrollLeft = 0;
        }, 300);
        searchIcon.style.opacity = "0";
    }

    // TODO: Implement font injection
    // setTimeout(() => {
    //     const style = document.createElement('style');
    //     style.innerHTML = `
    //         @font-face {
    //             font-family: 'MyFont';
    //             src: url(http://fonts.gstatic.com/s/fraunces/v24/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIc6RujDvTShUtWNg.ttf)
    //         }
    //     `;
    //     inputTextContainer.appendChild(style);


    //     inputText.style.fontFamily = `'MyFont', Inter`;
    // }, 1000);

    function updateSearchQuery() {
        $mainFontPickerData.searchQuery = inputText.textContent.toLowerCase();
    }
</script>

<main style={`${hasMargin ? "margin-right:6px" : ""}; width:${100+widthGrowPerc}%; ${minWidth !== "" ? `min-width:${minWidth}` : ""}`}>
    <Title name={name} sub={sub} align={alignTitle}/>
    
    <section bind:this={inputTextContainer} on:mousedown={() => {setTimeout(() => {inputText.focus()}, 0)}}>
        <!-- Search text -->
        <p bind:this={inputText} class="preview-text" contenteditable={true} spellcheck={false}
        on:keydown={checkEnterPress} on:focus={focusInput} on:blur={unFocusInput} on:mousedown={keepOpenOverlay} on:input={updateSearchQuery}
        style="font-family: {typeface.typeface}, Inter">{typeface.typeface}</p>

        <!-- Search icon -->
        <img bind:this={searchIcon} id="search-icon" src="./assets/icons/search.svg" alt="">
    </section>
</main>

<style lang="scss">
    @import "../../../../../public/guideline";

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