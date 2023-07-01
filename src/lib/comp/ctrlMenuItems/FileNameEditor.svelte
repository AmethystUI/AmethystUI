<script lang="ts">
    import { onMount } from "svelte";
    import { fileStat, saveName } from "$lib/stores/fileStatus";

    export let leftMenuWidth = 260;
    export let controlSectionWidth = 500;

    let fileNameField:HTMLSpanElement;
    const preventNewline = (e:KeyboardEvent):void =>{
        if(e.key === "Enter" || e.key === "Escape"){
            e.preventDefault();
            $fileStat.name = trimName(fileNameField.textContent)
            $saveName = $fileStat.name; // update save name
            fileNameField.textContent = $fileStat.name;
            fileNameField.blur();
            return;
        }
    };

    const trimName = (name: string) => {
        // trim the name to 50 characters
        return name.trim().substring(0, 50);
    }

    const pastePlainText = (e: ClipboardEvent):void =>{ // idk how this works but it works so don't touch it
        // Prevent the default action
        e.preventDefault();

        // Get the copied text from the clipboard
        const text = e.clipboardData.getData('text/plain');

        // Insert text at the current position of caret
        const range = document.getSelection().getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.selectNodeContents(textNode);
        range.collapse(false);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    onMount(() => { // once initialized
        fileNameField.onblur = ():void => {
            fileNameField.scrollLeft = 0;
        }
    })
</script>

<!-- HTML -->
<main>
    <span contenteditable=true placeholder="Untitled" on:keypress={preventNewline} on:paste={pastePlainText} bind:this={fileNameField} style="max-width:calc(100vw - {leftMenuWidth}px - {controlSectionWidth}px)">{$fileStat.name}</span>

    {#if $fileStat.alwaysShowSaveStatus}
        {#if !$fileStat.saved}
            <p>Edited</p>
        {:else}
            <p>Saved</p>
        {/if}
    {:else}
        {#if !$fileStat.saved}
            <p>Edited</p>
        {/if}
    {/if}
</main>

<!-- STYLE -->
<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    
    main{
        height: 100%; width: fit-content;
        background: $primaryl1;
        display: flex; flex-direction: column; justify-content: center;
        padding-left:4px;

        span{
            font-size: 23px;
            background: none;
            color: $secondarys1;
            border:none; outline:none;
            font-family: "Inter";
            font-variation-settings: "wght" 500;
            padding:0; margin:0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            text-align: left;
            cursor:text;
            padding-right: 15px;
            min-width: 120px;

            &:focus{
                max-width: calc(100vw - 350px) !important;
                overflow: scroll; text-overflow: clip;
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
            } &::-webkit-scrollbar {
                display: none;
            }
        }

        [contenteditable=true]:empty:before {
            content: attr(placeholder);
            color:$secondarys6;
        }

        p{
            font-size: 11px;
            margin-top:1px; padding:0;
            font-family: "Plus Jakarta Sans";
            font-variation-settings: "wght" 300;
            color: $secondarys5;
            user-select: none; -webkit-user-select: none;
            white-space: nowrap;
        }
    }
</style>