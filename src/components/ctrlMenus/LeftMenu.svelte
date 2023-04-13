<script lang="ts">
    import CollectionViewer from '../ctrlMenuItems/CollectionViewer.svelte';
    import ViewSwitcher from '../ctrlMenuItems/ViewSwitcher.svelte';
    import { createEventDispatcher } from 'svelte';
    import { currentView } from '../../stores/viewingManager';
    const disp = createEventDispatcher();

    let dragSpace:HTMLDivElement;
    let currentWidth = 260;

    $: if(!!dragSpace){ // as soon as dragSpace is initialized, add the drag event listener for resize
        dragSpace.onmousedown = ():void => { // when dragging
            document.onmousemove = (e:MouseEvent):void => {
                e.preventDefault();
                document.body.style.cursor = "col-resize";  // set consistent cursor
                if(e.clientX < 350 && e.clientX > 200){
                    currentWidth = e.clientX;
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
</script>

<!-- HTML -->
<main style="width: {currentWidth}px; position:absolute">
    <ViewSwitcher />

    <!-- We're setting display to none instead of using an if block here because we don't want initializing animations to play again -->
    <section style={$currentView === "element" ? "" : "display: none"}>
        <!-- collection viewing system -->
        <CollectionViewer containerWidth={currentWidth}/>
    </section>

    <section style={$currentView === "component" ? "" : "display: none"}>

    </section>

    <!-- resize trigger -->
    <div bind:this={dragSpace} id="drag-space"></div>

    <div id="bottom-gradient"></div>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../../../public/guideline";

    main{
        height:100vh;
        background-color: hsla(200, 5%, 14%, 0.7);
        border-right: 1px solid $primaryl4;
        position:absolute; top:0; left:0;
        
        -webkit-backdrop-filter: blur(100px);
        backdrop-filter: blur(100px);
        
        z-index: 9999;
        user-select: none; -webkit-user-select: none; -webkit-user-drag: none;

        &::before{
            content: "";
            width:100%; height:100%;
            position:absolute;
        }

        // @supports (-moz-appearance:none) { // disable transparency on firefox because fuck them
        //     background-color: hsl(200, 5%, 10%) !important;
        // }

        #drag-space{
            position:absolute;
            top:0; right: -3pt;
            height:100%; width:6pt;
            background-color: transparent;
            cursor:col-resize; z-index: 10;
        }
    }
</style>