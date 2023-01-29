<script lang="ts">
    import { fileStat } from "../../stores/fileStatus";

    export let leftMenuWidth = 260;
    export let controlSectionWidth = 500;

    let fileNameField:HTMLSpanElement;
    const preventNewline = (e:KeyboardEvent):void =>{
        if(e.key === "Enter" || e.key === "Escape"){
            e.preventDefault();
            fileNameField.blur();
            return;
        }
        if(fileNameField.innerHTML.length > 50){
            e.preventDefault();
            return;
        }
    };

    $: if(!!fileNameField){ // once initialized
        fileNameField.onblur = ():void => {
            fileNameField.scrollLeft = 0;
        }
    }
</script>

<!-- HTML -->
<main>
    <span type="text" contenteditable=true placeholder="Untitled" on:keypress={preventNewline} on:paste={(e) => e.preventDefault()} bind:this={fileNameField} style="max-width:calc(100vw - {leftMenuWidth}px - {controlSectionWidth}px)">{$fileStat.name}</span>

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
    @import "../../../public/guideline";
    
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