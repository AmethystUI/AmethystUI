<!-- This component is the floating window that houses interactive components such as ColorPickerOverlay -->
<!-- control functions for the overlay -->
<script lang="ts" context="module">
    import { get } from "svelte/store";
    import { setX, setY } from "$lib/stores/dynamicOverlayManager";

    // position & sizing tweening setup. These values are constantly being updated, so they have a flat accelerations.
    const xTween = tweened(get(mainDoverlayData).x, {easing: linear});
    const yTween = tweened(get(mainDoverlayData).y, {easing: linear});
    const wTween = tweened(get(mainDoverlayData).w, {easing: linear});
    const hTween = tweened(get(mainDoverlayData).h, {easing: linear});

    // the drag handle elements and tracker
    let dragHandleBar:HTMLDivElement, overlayScaler:HTMLElement, overlayContainer:HTMLElement;
    let dragThreshold = 100; // px
    let initCurX:number, initCurY:number;
    let initOverlayX:number, initOverlayY:number;
    let overlayPickupSize = 105; // in %
    let offsetCurX = 0, offsetCurY = 0; // how much offset the current cursor has to the edges of the overlay bounding box

    // visiblilty and position updating
    let visible = false;

    // current content inside of the overlay. Idk what the type of this is so I'll let it auto-intfer
    let content1 = null, content1container: HTMLElement;
    let content2 = null, content2container: HTMLElement;
    let updateFrameSize: (boolean)=>void = () => {}; // this is a pointer to the content resize function, so that whenever we want to update the size of the overlay based on current conditions, we can do it here.

    // ======================== EXPORTABLES ========================

    /**
     * Opens the overlay frame and updates its position and state.
     * 
     * @param {HTMLElement} trackingTarget - The element to track.
     * @param {() => void} updateSizeFunc - The function to update the size of the overlay
     * @param {string} componentID - The ID of the component that is about to become active
     * @param {boolean} [trackContinuously] - Whether to track to the element continuously (Default true)
     */
    export function openOverlayFrame(trackingTarget: HTMLElement | Element, updateSizeFunc: ()=>void, componentID: string, trackContinuously=true, content?:any):void {
        // set update frame size function
        updateFrameSize = updateSizeFunc;
        
        // set the content of the overlay to match
        updateContent(content);

        // update overlay size based on content

        mainDoverlayData.update(overlayDat => { // update the overlay
            overlayDat.overlayLocked=true; // lock overlay so it doesn't click off when activating
            overlayDat.isOpening = true;
            overlayDat.activeComponentID = componentID; // update active component ID
            return overlayDat
        });

        // reset the opening latch so we can still close the overlay
        setTimeout(() => {
            mainDoverlayData.update(overlayDat => {
                overlayDat.isOpening = false;
                return overlayDat
            });
        }, 2); // this is not a really great practice, but it works for now.

        setTimeout(() => {
            trackOverlay(trackingTarget, false);

            mainDoverlayData.update(overlayDat => { // update the overlay
                overlayDat.visible=true; // show overlay
                return overlayDat
            });
        }, 30); // 30ms update window for the width to change properly and shit. Again, not the best practice but whatever.

        // clear last tracking
        cancelAnimationFrame(get(mainDoverlayData).positionTrackingID);
        mainDoverlayData.update(overlayDat => {overlayDat.positionTrackingID = undefined; return overlayDat}); // We're setting trackingID to undefined so we can clear it.
        
        // update the position of the overlay and show it
        trackOverlay(trackingTarget, trackContinuously);
        
        // attach listners to close the overlay
        document.addEventListener("mouseup", unlockOverlay); // the purpose of this is to ensure that the user can close the overlay after the initial button down. This might appear kind of useless but DO NOT REMOVE THIS!
        document.addEventListener("mousedown", closeOverlayWithMouse);
        document.addEventListener("keydown", closeOverlayWithKey); 
    }
    
    /**
     * Close the overlay, assumign that it's open.
     */
    export function closeOverlay():void {
        // cancel position tracking
        cancelAnimationFrame(get(mainDoverlayData).positionTrackingID);
        
        setTimeout(() => {
            if(get(mainDoverlayData).isOpening){ // when this execisOpeningmeans that the reopening latch is opened and we shouldn't close the overlay. We will reset the latch and then close it on the next call.
                mainDoverlayData.update(overlayDat => {overlayDat.isOpening = false; return overlayDat});
                return;
            }
    
            overlayScaler.style.transitionDuration = "300ms";
    
            mainDoverlayData.update(overlayDat => {
                overlayDat.visible = false; // hide the overlay
                overlayDat.dragLocked = false; // undo drag lock
                overlayDat.overlayLocked = false; // undo overlay lock
                overlayDat.initialDrag = true; // reset initial drag to initial state
                overlayDat.activeComponentID = undefined; // reset active component
                return overlayDat;
            })

            // clear tracking animation
            mainDoverlayData.update(overlayDat => {overlayDat.positionTrackingID = undefined; return overlayDat});

            // reset content
            content1 = null;
            content2 = null;
            currentContent = null;

            // remove all event listeners
            document.removeEventListener("mouseup", unlockOverlay);
            document.removeEventListener("mousedown", closeOverlayWithMouse);
            document.removeEventListener("keydown", closeOverlayWithKey);
        }, 1);
    }

    /**
     * This function prevents the overlay from closing when open. It is mostly used to keep the overlay open.
     */
    export function keepOpenOverlay():void {
        mainDoverlayData.update(overlayDat => {overlayDat.overlayLocked=true; return overlayDat}); // lock overlay so it doesn't click off when clicking on the picker
        if(get(mainDoverlayData).visible) mainDoverlayData.update(overlayDat => {overlayDat.visible=true; return overlayDat});
    }

    // ======================== NON EXPORTABLES ========================

    // close the overlay with a click
    const closeOverlayWithMouse = (e:MouseEvent) => {
        if(!get(mainDoverlayData).overlayLocked && !get(mainDoverlayData).dragLocked){ // if not locked, remove picker overlay
            closeOverlay();
        }
    }
    
    // close the overlay with a key press
    const closeOverlayWithKey = (e:KeyboardEvent) => {
        if(!get(mainDoverlayData).dragLocked && !!e["key"] && e["key"] === "Escape") closeOverlay();
    }

    // unlock the overlay with a mouse up
    const unlockOverlay = () => {
        mainDoverlayData.update(overlayDat => {
            overlayDat.overlayLocked = false;
            return overlayDat
        });
    };

    /**
     * This function starts tracking the overlay to some given target (positionally).
     * 
     * @param {boolean} trackContinuously - whether or not to continously track the overlay
     * @param {HTMLElement} target - the target that the overlay should track to
     */
     const trackOverlay = (target: HTMLElement | Element, trackContinuously = true) =>{ // update position of the overlay
        if(!target) return; // no target

        const targetBB:DOMRect = target.getBoundingClientRect(); // get target position
        
        // set the X and Y position of the overlay and animate them. The min and max is for clamping the window position to be within the bounds of the window
        setX(Math.round(Math.min( window.innerWidth - get(mainDoverlayData).w/2 - 6, Math.max( get(mainDoverlayData).w/2 + 6, targetBB.x - get(mainDoverlayData).w/2 - 20 ) )));
        setY(Math.round(Math.min( window.innerHeight - get(mainDoverlayData).h/2 - 6, Math.max( get(mainDoverlayData).h/2 + 6, targetBB.y + 20 ) )));

        xTween.set(get(mainDoverlayData).x, {duration: !visible ? 0.001 : 200});
        wTween.set(get(mainDoverlayData).w, {duration: !visible ? 0.001 : 200});
        yTween.set(get(mainDoverlayData).y, {duration: !visible ? 0.001 : 200});
        hTween.set(get(mainDoverlayData).h, {duration: !visible ? 0.001 : 200});

        // set the tweens to the destination if it's accurate enough
        if(Math.round(get(xTween)) === get(mainDoverlayData).x) xTween.set(get(mainDoverlayData).x, {duration: 0.001})
        if(Math.round(get(yTween)) === get(mainDoverlayData).y) yTween.set(get(mainDoverlayData).y, {duration: 0.001})
        if(Math.round(get(wTween)) === get(mainDoverlayData).w) wTween.set(get(mainDoverlayData).w, {duration: 0.001})
        if(Math.round(get(hTween)) === get(mainDoverlayData).h) hTween.set(get(mainDoverlayData).h, {duration: 0.001})

        if(trackContinuously) { // continuously update the trackingID
            mainDoverlayData.update(overlayDat => { // the part that updates the overlayData with the new trackingID
                // get new animation frame
                overlayDat.positionTrackingID = requestAnimationFrame(() => trackOverlay(target, trackContinuously));
                return overlayDat;
            });
        }
    }

    let useContent1 = true;
    let currentContent: any;
    /**
     * This function updates the content inside of the overlay.
     * 
     * @param newContent - The new content that is to be updated
     */
    const updateContent = (newContent: any) => {
        // The way we're going to accomplish this is to constantly switch between content1 and content2. If useContent1 is active, we'll update to content1. If not, we'll update to content 2. The opacity and pointer events also switches around.

        if(!!newContent && newContent != currentContent){
            // set the new content size
            setTimeout(() => {
                updateFrameSize(true);
            }, 0);

            // set content
            if(useContent1) {
                if(!visible) content2 = null;
                content1 = null;
                setTimeout(() => {
                    content1 = newContent; 
                }, 0);
            }
            else {
                if(!visible) content1 = null;
                content2 = null;
                setTimeout(() => {
                    content2 = newContent; 
                }, 0);
            }

            // reverse pointer events
            content1container.style.pointerEvents = useContent1 ? "all" : "none";
            content2container.style.pointerEvents = useContent1 ? "none" : "all";

            // set opacities
            if(!visible){
                content1container.style.transitionDelay = "0ms";
                content2container.style.transitionDelay = "0ms";
            } else {
                content1container.style.transitionDelay = useContent1 ? "200ms" : "0ms";
                content2container.style.transitionDelay = useContent1 ? "0ms" : "200ms";
            }

            content1container.style.opacity = useContent1 ? "1" : "0";
            content2container.style.opacity = useContent1 ? "0" : "1";

            // inverse useContent1 and update current content
            currentContent = newContent;
            useContent1 = !useContent1;
        }
    }
</script>

<script lang="ts">
    import { tweened } from 'svelte/motion';
	import { linear } from 'svelte/easing';
    
    import { mainDoverlayData } from "$lib/stores/dynamicOverlayManager";

    $: x = $xTween;
    $: y = $yTween;
    $: w = $wTween;
    $: h = $hTween;

    // update overlay position, size, and visibility
    $: if(!!$mainDoverlayData){
        visible = $mainDoverlayData.visible;
        
        // this is to prevent the overlay from getting scrolled out of view. We only activate this when we're not dragging on the picker
        if(!$mainDoverlayData.dragLocked){
            if($mainDoverlayData.y - $mainDoverlayData.h/2 <= 10){
                $mainDoverlayData.y = 10 + $mainDoverlayData.h/2;
            }
            else if($mainDoverlayData.y + $mainDoverlayData.h/2 > window.innerHeight - 10){
                $mainDoverlayData.y = window.innerHeight - 10 - $mainDoverlayData.h/2;
            }
        }
    }

    const startDragWindow = (e:MouseEvent) => {
        // give the handle a low transition duration
        dragHandleBar.style.transitionDuration = "0ms";
        
        // track initial cursor positions
        initCurX = e.clientX;
        initCurY = e.clientY;

        // track initial overlay positions
        initOverlayX = $mainDoverlayData.x;
        initOverlayY = $mainDoverlayData.y;
        // calculate offset
        offsetCurX = initCurX - overlayContainer.getBoundingClientRect().x;
        offsetCurY = initCurY - overlayContainer.getBoundingClientRect().y;

        // reset all cursor offsets
        $mainDoverlayData.cursorOffsetX = 0;
        $mainDoverlayData.cursorOffsetY = 0;

        // scale up window if dragged when snapped
        if($mainDoverlayData.dragLocked) overlayScaler.style.transform = `scale(${overlayPickupSize}%) translate3d(0px, 0px, 0px)`;

        // add event listeners
        window.addEventListener("mousemove", dragWindow);
        window.addEventListener("mouseup", endDragWindow);
    }
    const dragWindow = (e:MouseEvent) => {
        e.preventDefault(); // prevent dragging on texts

        // track mouse position and move handle with it
        let deltaX = e.clientX - initCurX;
        let deltaY = e.clientY - initCurY;

        const largestDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
        // move the handle to show it being unsnapped
        if(!$mainDoverlayData.dragLocked){
            // dragHandleBar.style.transform = `translate3d(${deltaX/3}px, ${deltaY/3}px, 0px)`;
            overlayScaler.style.transform = `scale(${100 + (largestDelta * (overlayPickupSize-100) / dragThreshold)}%) translate3d(${deltaX/2.5}px, ${deltaY/2.5}px, 0px)`;
        }

        if(largestDelta > dragThreshold || $mainDoverlayData.dragLocked){
            // when this if statement executes, the window has either been snapped off or is dragged normally
            if(!$mainDoverlayData.dragLocked){
                overlayScaler.style.transitionDuration = `${800}ms`;
                overlayScaler.style.transform = `scale(${overlayPickupSize}%) translate3d(0px, 0px, 0px)`
                dragHandleBar.style.transitionDuration = `${800}ms`;
                dragHandleBar.style.transform = `translate3d(0px, 0px, 0px)`;

                // when it snaps off, retrack the initial pos X and Y of cursor and overlay
                initOverlayX = e.clientX - offsetCurX + $mainDoverlayData.w/2;
                initOverlayY = e.clientY - offsetCurY + $mainDoverlayData.h/2;
                initCurX = e.clientX;
                initCurY = e.clientY;
            }
            
            // snap the window x and y to cursor position
            $mainDoverlayData.dragLocked = true;

            // update frame size to the correct size;
            updateFrameSize(true);

            // prevent user dragging overlay out of window
            // I have no idea why this abomination works but it's not broken so i'm not gonna fix it
            if(e.clientX - offsetCurX > 10 && e.clientX - offsetCurX + $mainDoverlayData.w < (window.innerWidth - 10)){ // X axis
                $mainDoverlayData.x = initOverlayX + deltaX + ($mainDoverlayData.initialDrag ? $mainDoverlayData.cursorOffsetX : 0);
            } else {
                if(e.clientX - offsetCurX <= 10){
                    $mainDoverlayData.x = 10 + $mainDoverlayData.w/2;
                }
                else{
                    $mainDoverlayData.x = window.innerWidth - $mainDoverlayData.w/2 - 10;
                }
            }

            if(e.clientY - offsetCurY > 12 && e.clientY - offsetCurY + $mainDoverlayData.h < (window.innerHeight - 12)){ // Y axis
                $mainDoverlayData.y = initOverlayY + deltaY +  ($mainDoverlayData.initialDrag ? $mainDoverlayData.cursorOffsetY : 0);
            } else {
                if(e.clientY - offsetCurY <= 12){
                    $mainDoverlayData.y = 12 + $mainDoverlayData.h/2;
                }
                else{
                    $mainDoverlayData.y = window.innerHeight - $mainDoverlayData.h/2 - 12;
                }
            }

        } else {
            overlayScaler.style.transitionDuration = "0ms";
        }
    }
    const endDragWindow = () => {
        overlayScaler.style.transitionDuration = "300ms";
        overlayScaler.style.transform = `scale(100%)`
        dragHandleBar.style.transitionDuration = "300ms";
        dragHandleBar.style.transform = `translate3d(0px, 0px, 0px)`;

        // update the initialDrag latch
        if(!!$mainDoverlayData.dragLocked){
            $mainDoverlayData.initialDrag = false;
        }

        window.removeEventListener("mousemove", dragWindow);
        window.removeEventListener("mouseup", endDragWindow);
    }

    const lockOverlay = () => {
        $mainDoverlayData.overlayLocked = true;
    }
    const unlockOverlay = () => {
        setTimeout(() => {
            $mainDoverlayData.overlayLocked = false;
        }, 0);
    }

    // detect when window changes width, and adjust the position of color picker as needed
    window.addEventListener("resize", e => {
        if(!$mainDoverlayData.dragLocked) return; // only activate when dragLocked
        
        if($mainDoverlayData.x - $mainDoverlayData.w/2 <= 10){
            $mainDoverlayData.x = 10 + $mainDoverlayData.w/2;
        }
        else if($mainDoverlayData.x + $mainDoverlayData.w/2 > window.innerWidth - 10){
            $mainDoverlayData.x = window.innerWidth - $mainDoverlayData.w/2 - 10;
        }
        if($mainDoverlayData.y - $mainDoverlayData.h/2 <= 10){
            $mainDoverlayData.y = 10 + $mainDoverlayData.h/2;
        }
        else if($mainDoverlayData.y + $mainDoverlayData.h/2 > window.innerHeight - 10){
            $mainDoverlayData.y = window.innerHeight - 10 - $mainDoverlayData.h/2;
        }
    })
</script>

<section bind:this={overlayContainer} id="overlayContainer" class={`${visible ? `${$mainDoverlayData.dragLocked ? "" : ""}` : "hidden"}`} style={`transform: translate3d(${x - $mainDoverlayData.w/2}px,${y - $mainDoverlayData.h/2}px,0px); width: ${$mainDoverlayData.w}px; height: ${$mainDoverlayData.h}px`}>
    <main on:mousedown={lockOverlay} on:mouseup={unlockOverlay} style={`
            transform: scale(${$mainDoverlayData.visible ? 100 : 80}%);
        `} bind:this={overlayScaler}>
        
        <!-- background that can change size -->
        <div id="background">
            <div id="center" style={`transform: scale(${w - 14}%, ${h - 14}%)`}></div>>

            <!-- border corners -->
            <div id="west" style={`transform: scaleY(${h - 14}%) translate3d(-${w/2-8}px, 0px, 0px)`}></div>
            <div id="east" style={`transform: scaleY(${h - 14}%) translate3d(${w/2-8}px, 0px, 0px)`}></div>
            <div id="north" style={`transform: scaleX(${w - 14}%) translate3d(0px, -${h/2-13}px, 0px)`}></div>
            <div id="south" style={`transform: scaleX(${w - 14}%) translate3d(0px, ${h/2-13}px, 0px)`}></div>
    
            <div id="nw" style={`transform: translate3d(-${w/2-8}px, -${h/2-13}px, 0px)`}></div>
            <div id="ne" style={`transform: translate3d(${w/2-8}px, -${h/2-13}px, 0px)`}></div>
            <div id="sw" style={`transform: translate3d(-${w/2-8}px, ${h/2-13}px, 0px)`}></div>
            <div id="se" style={`transform: translate3d(${w/2-8}px, ${h/2-13}px, 0px)`}></div>
        </div>

        <!-- drag handle -->
        <div id="drag-handle" on:mousedown={startDragWindow} style={`transform: translate3d(0px, -${h/2-17}px, 0px)`}>
            <!-- for decorative purposes only -->
            <div id="handle-bar" bind:this={dragHandleBar}>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>

        <section id="snapped-title-container">
            
            <p on:click={closeOverlay} style={`transform: translate3d(${w/2-28}px, -${h/2-10}px, 0px)`}>Done</p>
        </section>

        <!-- parent that clip the content. The -1 pixel is there to account for the border width -->
        <!--============================= OVERLAY CONTENT GOES HERE =============================-->
        <section bind:this={content1container} class="contentContainer" style="pointer-events: all; opacity: 1">
            <svelte:component this={content1}/>
        </section>
        <section bind:this={content2container} class="contentContainer" style="pointer-events: none; opacity: 0">
            <svelte:component this={content2}/>
        </section>
    </main>
</section>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    :root{
        -webkit-user-drag: none !important
    }

    #overlayContainer{
        position: fixed; z-index: 200; top:0;left:0;
        transition: 150ms opacity ease-in-out;
        &.hidden{
            opacity:0;
            pointer-events: none;
        }
    }
    
    main{
        width:100%; height: 100%;
        
        background: none;
        display: flex; align-items: center; justify-content: center;

        border-radius: 9px;
        cursor: default; pointer-events: all;

        pointer-events: inherit;

        transition: all 200ms ease;

        #snapped-title-container{
            width:100%; height:100%; position:absolute; top:7.1px; right:7.1px;
            display: flex; justify-content: center; align-items: center;
            margin: 0px;
            user-select: none; -webkit-user-select: none;
            pointer-events: none;
            z-index: 2;

            p{
                position: absolute;
                color: $secondarys4;
                padding: 2px 10px 2px 10px;
                border-radius: 100px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer; pointer-events: all;

                &:hover{
                    color: $secondary;
                    background-color: hsla(0,0%,100%,20%);
                }
            }
        }

        #background{
            position:absolute;
            display:flex; justify-content: center; align-items: center; padding:0; margin:0;
            
            #center{
                position:absolute;
                width:100px; height:100px; // use 100px so the percentage scaling is also correspondent to it

                box-shadow: 0px 3px 10px 2px hsla(0,0%,0%,70%);
            }

            div{
                background-color: $primaryl1;
                z-index: 0;
            }

            #west{
                position:absolute; left:-3.5px;
                width: 7.1px; height:100px;
                border-left: 1px solid $primaryl4;
            }
            #east{
                position:absolute; right:-3.5px;
                width: 7.1px; height:100px;
                border-right: 1px solid $primaryl4;
            }
            #north{
                position:absolute; top:-3.5px;
                height:7.1px; width:100px;
                border-top: 1px solid $primaryl4;
            }
            #south{
                position:absolute; bottom:-3.5px;
                height:7.1px; width:100px;
                border-bottom: 1px solid $primaryl4;
            }

            #nw{
                position:absolute; left:-3.5px; top:-3.5px;
                height:7.1px; width: 7.1px;
                border-radius: 7.1px 0 0 0;
                border-left: 1px solid $primaryl4; border-top: 1px solid $primaryl4;
            }
            #ne{
                position:absolute; right:-3.5px; top:-3.5px;
                height:7.1px; width: 7.1px;
                border-radius: 0 7.1px 0 0;
                border-right: 1px solid $primaryl4; border-top: 1px solid $primaryl4;
            }
            #se{
                position:absolute; right:-3.5px; bottom:-3.5px;
                height:7.1px; width: 7.1px;
                border-radius: 0 0 7.1px 0;
                border-right: 1px solid $primaryl4; border-bottom: 1px solid $primaryl4;
            }
            #sw{
                position:absolute; left:-3.5px; bottom:-3.5px;
                height:7.1px; width: 7.1px;
                border-radius: 0 0 0 7.1px;
                border-left: 1px solid $primaryl4; border-bottom: 1px solid $primaryl4;
            }
        }
        
        #drag-handle{
            width:40px; height:10px;
            border-radius: 0px;
            display: flex; justify-content: center; align-items: center;
            padding-bottom:12.5px;
            position:absolute;
            z-index: 2;
            cursor: grab;

            &:active{
                width:100vw; height:100vh;
                cursor: grabbing;
            }

            #handle-bar{
                position:absolute;
                padding-top: 14px;
                display: flex;
                
                transition: transform $normal-ease-out;
                z-index: 200;

                div{
                    width:6px; height:6px;
                    margin: 0px 1px 0px 1px;
                    border-radius: 100px;
                    background-color: $secondarys4;
                }
            }
        }

        .contentContainer{
            position: absolute;
            width:fit-content;
            height:fit-content;
            background:none;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 120ms linear;
        }
    }
</style>