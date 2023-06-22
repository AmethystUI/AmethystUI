<script lang="ts">
    import { selectedComponent, selectedOverride, focusedOverride, layerDeleteLock } from "$lib/stores/collection";

    import BoundingBoxEditor from "$lib/comp/ctrlMenuItems/StyleEditors/BoundingBoxEditor.svelte";
    import BorderEditor from "$lib/comp/ctrlMenuItems/StyleEditors/BorderEditor.svelte";
    import OutlineEditor from "$lib/comp/ctrlMenuItems/StyleEditors/OutlineEditor.svelte";
    import BackgroundEditor from "$lib/comp/ctrlMenuItems/StyleEditors/BackgroundEditor.svelte";
    import AppearanceEditor from "$lib/comp/ctrlMenuItems/StyleEditors/AppearanceEditor.svelte";
    
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    import ShadowEditor from "$lib/comp/ctrlMenuItems/StyleEditors/ShadowEditor.svelte";
    import TextEditor from "$lib/comp/ctrlMenuItems/StyleEditors/TextEditor.svelte";
    const disp = createEventDispatcher();

    let dragSpace:HTMLDivElement;
    let currentWidth = 330;

    $: if(!!dragSpace){ // as soon as dragSpace is initialized, add the drag event listener for resize
        dragSpace.onmousedown = ():void => { // when dragging
            document.onmousemove = (e:MouseEvent):void => {
                e.preventDefault();
                document.body.style.cursor = "col-resize";  // set consistent cursor
                if(window.innerWidth - e.clientX < 500 && window.innerWidth - e.clientX > 300){
                    currentWidth = window.innerWidth - e.clientX;
                    disp("widthChange", {
                        width: currentWidth
                    });
                }
            }
        };
        document.onmouseup = ():void => { // when finished dragging
            document.body.style.cursor = "default"; // reset cursor
            document.onmousemove = undefined
        }
    }

    onMount(() => {
        disp("widthChange", {
            width: currentWidth
        });
    })

    onDestroy(() => {
        disp("widthChange", {
            width: 0
        });
    })
</script>

<!-- HTML -->
<main style="width: {currentWidth}px; max-width: {currentWidth}px; position: absolute">
    <!-- resize trigger -->
    <div bind:this={dragSpace} id="drag-space" style={`top:0; right:${currentWidth-3}px`}></div>

    <!-- show editors if there is an override or element selected -->
    {#if $selectedComponent !== -1 || $selectedOverride !== -1}
        <!-- size editor -->
        <BoundingBoxEditor currentParentWidth={currentWidth}/>

        <!-- appearance editor -->
        <AppearanceEditor currentParentWidth={currentWidth}/>
        
        <!-- background editor -->
        <BackgroundEditor/>
        
        <!-- border editor -->
        <BorderEditor currentParentWidth={currentWidth}/>
        
        <!-- outline editor -->
        <OutlineEditor currentParentWidth={currentWidth}/>

        <!-- text editor -->
        <TextEditor currentParentWidth={currentWidth}/>

        <!-- shadow editor -->
        <ShadowEditor/>
        
        <div style="min-height:50%; height:50%"></div>
    {/if}
</main>

<!-- STYLE -->
<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    
    main{
        height:calc(100vh - 65px);
        background-color: $primaryl1;
        border-left: 1px solid $primaryl4;
        top:65px; right:0;
        display:flex; flex-direction: column;
        z-index: 17;
        overflow-y:scroll;
        // hide scrollbar
        // &::-webkit-scrollbar { width: 0 !important }


        #drag-space{
            position:fixed;
            height:100%; width:6pt;
            background:none;
            cursor:col-resize; z-index: 10;
        }
    }
</style>