<script lang="ts">
    import { activeStyles } from "../../../stores/activeStyles";
    import { canvasStatus } from "../../../stores/canvasStatus";
    import { collection, selectedComponent, selectedOverride } from "../../../stores/collection";

    let icx = 0; // initial cursor x
    let icy = 0; // initial cursor y
    let iw = 0; // initial target width
    let ih = 0; // initial target height
    let dragLocked = true; // prevent dragging on accident
    const dragThreshold = -1; // disable if -1
    let hovered = false; // whether the mouse is overring over the resize zone

    let rX = false; let rY = false;
    let cX = true; let cY = true;

    // reactive
    $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;
    $: currentComponent = $collection[$selectedComponent];
    $: currentOverride = $selectedOverride !== -1 ? $collection[$selectedComponent].styleOverrides[$selectedOverride] : undefined;

    const startCornerDrag = (e:MouseEvent, revX:boolean, revY:boolean, changeX:boolean, changeY:boolean) => {
        // set icx and icy to current mouse position
        icx = e.clientX;
        icy = e.clientY;

        // set iw and ih to current component width / height
        if($selectedOverride !== -1){
            iw = currentOverride?.style?.width?.v ?? 0;
            ih = currentOverride?.style?.height?.v ?? 0;
        } else {
            iw = currentComponent?.style?.width?.v ?? 0;
            ih = currentComponent?.style?.height?.v ?? 0;
        }

        // set reverse
        rX = revX; rY = revY;
        // set enable
        cX = changeX; cY = changeY;

        // start tracking mouse position on move
        document.addEventListener('mousemove', trackCornerDrag);
        document.addEventListener('mouseup', endDrag);
    }
    const trackCornerDrag = (e:MouseEvent) => {
        e.preventDefault();
        
        // check threshold
        if(dragLocked){
            if(Math.abs(e.clientX - icx) > dragThreshold){
                // unlock drag
                dragLocked = false;
            }
            return;
        }

        // check if there is an override selected
        let deltaW = e.clientX - icx;
        let deltaH = e.clientY - icy;

        // detect if shift is pressed when dragging
        if(e.shiftKey){ // keep square ratio
            const minVal = Math.min(deltaW, -deltaH);
            deltaW = (rX ? 1 : -1) * minVal;
            deltaH = (rY ? 1 : -1) * minVal;
        }

        if($selectedOverride === -1){ // no override = change component
            const tempW = $collection[$selectedComponent].style["width"];
            const tempH = $collection[$selectedComponent].style["height"];

            // check units too
            if(cX && tempW.u !== "fit-content"){
                if(rX) $collection[$selectedComponent].style["width"].v = iw + deltaW < 0 ? 0 : iw + deltaW;
                else  $collection[$selectedComponent].style["width"].v = iw - deltaW < 0 ? 0 : iw - deltaW;
            } if(cY && tempH.u !== "fit-content"){
                if(rY) $collection[$selectedComponent].style["height"].v = ih + deltaH < 0 ? 0 : ih + deltaH;
                else $collection[$selectedComponent].style["height"].v = ih - deltaH < 0 ? 0 : ih - deltaH;
            } 
        } else { // else change override
            const tempW = $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"];
            const tempH = $collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"];

            // check units too
            if(cX && tempW.u !== "fit-content"){
                if(rX) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].v = iw + deltaW < 0 ? 0 : iw + deltaW;
                else  $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].v = iw - deltaW < 0 ? 0 : iw - deltaW;
            } if(cY && tempH.u !== "fit-content"){
                if(rY) $collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"].v = ih + deltaH < 0 ? 0 : ih + deltaH;
                else $collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"].v = ih - deltaH < 0 ? 0 : ih - deltaH;
            }
        }
    }

    //  margin value; margin unit; border value; border unit
    let cMT = 0; let cMTu = ""; let cBT = 0; let cBTu = ""; // margin + border needs to be considered
    let cMR = 0; let cMRu = ""; let cBR = 0; let cBRu = "";
    let cMB = 0; let cMBu = ""; let cBB = 0; let cBBu = "";
    let cML = 0; let cMLu = ""; let cBL = 0; let cBLu = "";
    
    let imt = 0; // initial margin top, right, bottom, left
    let imr = 0;
    let imb = 0;
    let iml = 0;

    $: if(!!currentStyle){
        cMT = !!currentStyle["marginTop"] ? currentStyle["marginTop"].v : 0;
        cMR = !!currentStyle["marginRight"] ? currentStyle["marginRight"].v : 0;
        cMB = !!currentStyle["marginBottom"] ? currentStyle["marginBottom"].v : 0;
        cML = !!currentStyle["marginLeft"] ? currentStyle["marginLeft"].v : 0;

        cBT = !!currentStyle.borderWidthTop && currentStyle.USEBORDER ? currentStyle.borderWidthTop.v : 0;
        cBR = !!currentStyle.borderWidthRight && currentStyle.USEBORDER ? currentStyle.borderWidthRight.v : 0;
        cBB = !!currentStyle.borderWidthBottom && currentStyle.USEBORDER ? currentStyle.borderWidthBottom.v : 0;
        cBL = !!currentStyle.borderWidthLeft && currentStyle.USEBORDER ? currentStyle.borderWidthLeft.v : 0;

        cMTu = !!currentStyle["marginTop"] ? currentStyle["marginTop"].u : "px";
        cMRu = !!currentStyle["marginRight"] ? currentStyle["marginRight"].u : "px";
        cMBu = !!currentStyle["marginBottom"] ? currentStyle["marginBottom"].u : "px";
        cMLu = !!currentStyle["marginLeft"] ? currentStyle["marginLeft"].u : "px";

        cBTu = !!currentStyle.borderWidthTop ? currentStyle.borderWidthTop.u : "px";
        cBRu = !!currentStyle.borderWidthRight ? currentStyle.borderWidthRight.u : "px";
        cBBu = !!currentStyle.borderWidthBottom ? currentStyle.borderWidthBottom.u : "px";
        cBLu = !!currentStyle.borderWidthLeft ? currentStyle.borderWidthLeft.u : "px";
    }

    // drag functions
    const startMTDrag = (e:MouseEvent) => {
        // set icx/icy to current mouse position
        icy = e.clientY;
        // set imt
        if($selectedOverride !== -1){
            imt = currentOverride?.style?.marginTop?.v ?? 0;
        } else {
            imt = currentComponent?.style?.marginTop?.v ?? 0;
        }

        // start tracking mouse position on move
        document.addEventListener('mousemove', trackMTDrag);
        document.addEventListener('mouseup', endDrag);
    }
    const trackMTDrag = (e:MouseEvent) => {
        e.preventDefault();
        // check threshold
        if(dragLocked){
            if(Math.abs(e.clientY - icy) > dragThreshold){
                dragLocked = false; // unlock drag
            } return;
        }
        
        // check if there is an override selected
        let deltaY = icy - e.clientY;

        if($selectedOverride === -1){ // no override = change component
            $collection[$selectedComponent].style["marginTop"].v = imt + deltaY < 0 ? 0 : imt + deltaY;
        } else { // else change override
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginTop"].v = imt + deltaY < 0 ? 0 : imt + deltaY;
        }
    }
    const startMBDrag = (e:MouseEvent) => {
        // set icx/icy to current mouse position
        icy = e.clientY;
        // set imb
        if($selectedOverride !== -1){
            imb = currentOverride?.style?.marginBottom?.v ?? 0;
        } else {
            imb = currentComponent?.style?.marginBottom?.v ?? 0;
        }

        // start tracking mouse position on move
        document.addEventListener('mousemove', trackMBDrag);
        document.addEventListener('mouseup', endDrag);
    }
    const trackMBDrag = (e:MouseEvent) => {
        e.preventDefault();
        // check threshold
        if(dragLocked){
            if(Math.abs(e.clientY - icy) > dragThreshold){
                dragLocked = false; // unlock drag
            } return;
        }
        
        // check if there is an override selected
        let deltaY = e.clientY - icy;

        if($selectedOverride === -1){ // no override = change component
            $collection[$selectedComponent].style["marginBottom"].v = imb + deltaY < 0 ? 0 : imb + deltaY;
        } else { // else change override
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginBottom"].v = imb + deltaY < 0 ? 0 : imb + deltaY;
        }
    }
    const startMRDrag = (e:MouseEvent) => {
        icx = e.clientX;
        // set imr
        if($selectedOverride !== -1){
            imr = currentOverride?.style?.marginRight?.v ?? 0;
        } else {
            imr = currentComponent?.style?.marginRight?.v ?? 0;
        }
        
        // start tracking mouse position on move
        document.addEventListener('mousemove', trackMRDrag);
        document.addEventListener('mouseup', endDrag);
    }
    const trackMRDrag = (e:MouseEvent) => {
        e.preventDefault();
        // check threshold
        if(dragLocked){
            if(Math.abs(e.clientX - icx) > dragThreshold){
                dragLocked = false; // unlock drag
            } return;
        }
        
        // check if there is an override selected
        let deltaX = e.clientX - icx;

        if($selectedOverride === -1){ // no override = change component
            $collection[$selectedComponent].style["marginRight"].v = imr + deltaX < 0 ? 0 : imr + deltaX;
        } else { // else change override
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginRight"].v = imr + deltaX < 0 ? 0 : imr + deltaX;
        }
    }
    const startMLDrag = (e:MouseEvent) => {
        icx = e.clientX;
        // set iml
        if($selectedOverride !== -1){
            iml = currentOverride?.style?.marginLeft?.v ?? 0;
        } else {
            iml = currentComponent?.style?.marginLeft?.v ?? 0;
        }
        
        // start tracking mouse position on move
        document.addEventListener('mousemove', trackMLDrag);
        document.addEventListener('mouseup', endDrag);
    }
    const trackMLDrag = (e:MouseEvent) => {
        e.preventDefault();
        // check threshold
        if(dragLocked){
            if(Math.abs(e.clientX - icx) > dragThreshold){
                dragLocked = false; // unlock drag
            } return;
        }
        
        // check if there is an override selected
        let deltaX = icx - e.clientX;

        if($selectedOverride === -1){ // no override = change component
            $collection[$selectedComponent].style["marginLeft"].v = iml + deltaX < 0 ? 0 : iml + deltaX;
        } else { // else change override
            $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginLeft"].v = iml + deltaX < 0 ? 0 : iml + deltaX;
        }
    }

    const endDrag = () => {
        document.body.style.cursor = "normal";
        
        // reset initial cursor positions
        icx = 0; // initial cursor x
        icy = 0; // initial cursor y
        dragLocked = true; // prevent dragging on accident

        document.removeEventListener('mousemove', trackMTDrag);
        document.removeEventListener('mousemove', trackMRDrag);
        document.removeEventListener('mousemove', trackMBDrag);
        document.removeEventListener('mousemove', trackMLDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('mousemove', trackCornerDrag);
        document.removeEventListener('mouseup', endDrag);
    }

    $: defaultKnobLightness = $canvasStatus.darkCanvas ? 30 : 80;
    $: cornerKnobLightness = currentStyle.USEBACKGROUND ? currentStyle.backgroundColor?.l + 30 ?? defaultKnobLightness : defaultKnobLightness
</script>

<main style={`
    ${(currentStyle.width?.u ?? "px") === "fit-content"
    ? // if the current width is "fit-content"
    `
        width: 100%;
    ` : // other wise, just use normal width
    `
        width: calc(
            ${currentStyle.width?.v ?? 0}${currentStyle.width?.u ?? "px"} + 
            ${currentStyle.paddingLeft?.v ?? 0}${currentStyle.paddingLeft?.u ?? "px"} +
            ${currentStyle.paddingRight?.v ?? 0}${currentStyle.paddingRight?.u ?? "px"}
        );
    `}

    ${(currentStyle.height?.u ?? "px") === "fit-content"
    ? // if the current width is "fit-content"
    `
        height: 100%;
    ` : // other wise, just use normal width
    `
        height: calc(
            ${currentStyle.height?.v ?? 0}${currentStyle.height?.u ?? "px"} + 
            ${currentStyle.paddingTop?.v ?? 0}${currentStyle.paddingTop?.u ?? "px"} +
            ${currentStyle.paddingBottom?.v ?? 0}${currentStyle.paddingBottom?.u ?? "px"}
        );
    `}

    transform: translate3d(calc(${cBR/2}${cBRu} + ${cBL/2}${cBLu}), calc(${cBT/2}${cBTu} + ${cBB/2}${cBBu}), 0px);
`}>
    {#if $activeStyles.width || $activeStyles.height}
        <!-- size handlers -->

        <!-- Top and bottoms -->
        {#if (currentStyle?.height?.u !== "fit-content")}
            <div class="corner-drag {hovered ? "visible" : ""} {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}"
                id="corner-tm"
                on:mousedown={e => startCornerDrag(e, false, false, false, true)}></div>
            <div class="corner-drag {hovered ? "visible" : ""} {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}"
                id="corner-bm"
                on:mousedown={e => startCornerDrag(e, false, true, false, true)}></div>
        {/if}

        <!-- Left and Right -->
        {#if (currentStyle?.width?.u !== "fit-content")}
            <div class="corner-drag {hovered ? "visible" : ""} {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}"
                id="corner-ml"
                on:mousedown={e => startCornerDrag(e, false, false, true, false)}></div>
            <div class="corner-drag {hovered ? "visible" : ""} {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}"
                id="corner-mr"
                on:mousedown={e => startCornerDrag(e, true, false, true, false)}></div>
        {/if}

        <!-- The corner ones -->
        {#if (currentStyle?.width?.u !== "fit-content") || (currentStyle?.height?.u !== "fit-content")}
            <div class="corner-drag {hovered ? "visible" : ""} {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}"
                id="corner-tl"
                on:mousedown={e => startCornerDrag(e, false, false, true, true)}></div>
            <div class="corner-drag {hovered ? "visible" : ""} {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}"
                id="corner-tr"
                on:mousedown={e => startCornerDrag(e, true, false, true, true)}></div>
            <div class="corner-drag {hovered ? "visible" : ""} {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}"
                id="corner-bl"
                on:mousedown={e => startCornerDrag(e, false, true, true, true)}></div>
            <div class="corner-drag {hovered ? "visible" : ""} {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}"
                id="corner-br"
                on:mousedown={e => startCornerDrag(e, true, true, true, true)}></div>
        {/if}
    {/if}

    <!-- margin resizers -->
    {#if $activeStyles.marginTop || $activeStyles.marginBottom || $activeStyles.marginLeft || $activeStyles.marginRight}
        <!-- top -->
        <div class="margin-handle vert-margins {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}" id="top" style={`
            transform: translate3d(0,calc(${-cMT-1}${cMTu} + ${-cBT}${cBTu}),0); min-width:min(${cML}${cMLu}, ${cMR}${cMRu}); opacity:${cMT < 1 ? 0 : 1}; cursor: ${cMT > 0 ? "ns-resize" : "n-resize"};
            `} on:mousedown={startMTDrag}></div>
        <!-- right -->
        <div class="margin-handle hori-margins {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}" id="right" style={`
            transform: translate3d(calc(${cMR}${cMRu} + ${cBR}${cBRu}),0,0); min-height:min(${cMT}${cMTu}, ${cMB}${cMBu}); opacity:${cMR < 1 ? 0 : 1}; cursor: ${cMR > 0 ? "ew-resize" : "e-resize"};
            `} on:mousedown={startMRDrag}></div>
        <!-- bottom -->
        <div class="margin-handle vert-margins {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}" id="bottom" style={`
            transform: translate3d(0,calc(${cMB}${cMBu} + ${cBB}${cBBu}),0); min-width:min(${cML}${cMLu}, ${cMR}${cMRu}); opacity:${cMB < 1 ? 0 : 1}; cursor: ${cMB > 0 ? "ns-resize" : "s-resize"};
            `} on:mousedown={startMBDrag}></div>
        <!-- left -->
        <div class="margin-handle hori-margins {$canvasStatus.darkCanvas ? "darkmode" : "lightmode"}" id="left" style={`
            transform: translate3d(calc(${-cML-1}${cMLu} + ${-cBL}${cBLu}),0,0); min-height:min(${cMT}${cMTu}, ${cMB}${cMBu}); opacity:${cML < 1 ? 0 : 1}; cursor: ${cML > 0 ? "ew-resize" : "w-resize"};
            `} on:mousedown={startMLDrag}></div>
    {/if}
</main>

<style lang="scss">
    @import "../../../../public/guideline";

    main{
        $corner-offset: -3.5px;

        position: absolute;
        background: none;
        display:flex; flex-direction: column; justify-content: center; align-items: center;
        padding: 0px;
        pointer-events: none;
        z-index: 1000;

        &:active{
            .corner-drag{
                &.darkmode{ border-color: $secondary !important }
                &.lightmode { border-color: $primary !important }
                opacity: 1;
            }
            .margin-handle{
                opacity: 1 !important;
                &.darkmode{ background-color: $secondary !important }
                &.lightmode { background-color: $primary !important }
            }
        }
        &:hover{
            .corner-drag{
                opacity: 1;
            }
        }
    
        .corner-drag{
            width: 10px; height: 10px;
            border-radius: 100%;            
            position: absolute;
            z-index: 2000;
            opacity: 0;
            transition: opacity ease 100ms;

            &.darkmode{
                background-color: $primary;
                box-shadow: 0px 0px 0px 2px $primary;
                border: 1px solid $secondary;
            } &.lightmode{
                background-color: hsla(0%, 0%, 98%, 100%);
                box-shadow: 0px 0px 0px 2px hsla(0%, 0%, 98%, 100%);
                border: 1px solid $primary;
            }

            &:hover{
                opacity: 1 !important;
                &.darkmode{ background-color: $secondary }
                &.lightmode{ background-color: $primary }
            }

            &:active{
                z-index: 4000;
                &.darkmode{ background-color: $secondary }
                &.lightmode{ background-color: $primary }

                &::before{
                    width: 100vw !important; height: 100vh !important;
                    left: -50vw; top: -50vh;
                }
            }

            &::before{
                content:"";
                width: 30px; height:30px;
                position:absolute;
                pointer-events: all;
                
                // FOR DEBUGGING ONLY
                // border: 1px solid blue;
            }

            &#corner-tl{
                top: calc(-5px / 2) + $corner-offset;
                left: calc(-5px / 2) + $corner-offset;
                cursor: nwse-resize;

                &::before{ transform: translate3d(-20px,-20px,0px) }
            }
            &#corner-tm{
                top: calc(-5px / 2) + $corner-offset;
                cursor: ns-resize;

                &::before{ width: 10px; transform: translate3d(-1px,-20px,0px) }
            }
            &#corner-tr{
                top: calc(-5px / 2) + $corner-offset;
                right: calc(-5px / 2) + $corner-offset;
                cursor: nesw-resize;

                &::before{ transform: translate3d(-1px,-20px,0px) }
            }
            &#corner-ml{
                left: calc(-5px / 2) + $corner-offset;
                cursor: ew-resize;

                &::before{ height: 10px; transform: translate3d(-20px,-1px,0px) }
            }
            &#corner-mr{
                right: calc(-5px / 2) + $corner-offset;
                cursor: ew-resize;

                &::before{ height: 10px; transform: translate3d(-1px,-1px,0px) }
            }
            &#corner-bl{
                bottom: calc(-5px / 2) + $corner-offset;
                left: calc(-5px / 2) + $corner-offset;
                cursor: nesw-resize;

                &::before{ transform: translate3d(-20px,-1px,0px) }
            }
            &#corner-bm{
                bottom: calc(-5px / 2) + $corner-offset;
                cursor: ns-resize;

                &::before{ width: 10px; transform: translate3d(-1px,-1px,0px) }
            }
            &#corner-br{
                bottom: calc(-5px / 2) + $corner-offset;
                right: calc(-5px / 2) + $corner-offset;
                cursor: nwse-resize;

                &::before{ transform: translate3d(-1px,-1px,0px) }
            }
        }


        .margin-handle{
            transition: opacity ease 100ms background-color ease 100ms;

            position:absolute;
            pointer-events: all;
            z-index: 999;

            &.darkmode{
                background-color: hsla(0%, 0%, 100%, 20%);
                &:hover{
                    background-color: $secondary;
                }
            } &.lightmode{
                background-color: hsla(0%, 0%, 0%, 20%);
                &:hover{
                    background-color: $primary;
                }
            }

            &:hover{
                opacity: 1 !important;
            }
            &:active{
                z-index: 4000;

                &::before{
                    width: 100vw; height: 100vh;
                    left: -50vw; top: -50vh;
                }
            }

            &::before{
                content:"";
                position:absolute;
                pointer-events: all;
                background: none;
            }
        }

        .vert-margins{
            width: calc(70% + 10px); height:1.5px;
            cursor:ns-resize;

            &::before{
                width: 100%; height:30px;

                // FOR DEBUGGING ONLY
                // border: 1px solid red;
            }
        }
        .hori-margins{
            width: 1.5px; height: calc(70% + 10px);
            cursor:ew-resize;

            &::before{
                content:"";
                width: 30px; height:100%;

                // FOR DEBUGGING ONLY
                // border: 1px solid yellow;
            }
        }

        #top{
            top: 0;

            &::before{ transform: translate3d(0px, -20px, 0px) }
        }
        #bottom{
            bottom: 0;

            &::before{ transform: translate3d(0px, -10px, 0px) }
        }
        #right{
            right: 0;

            &::before{ transform: translate3d(-10px, 0px, 0px) }
        }
        #left{
            left: 0;

            &::before{ transform: translate3d(-20px, 0px, 0px) }
        }
    }
</style>