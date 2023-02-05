<script lang="ts">
    import { addOverride, collection, focusedComponent, HTMltagInfo, selectedComponent, selectedOverride, focusedOverride, layerDeleteLock } from "../../../stores/collection";

    let icx = 0; // initial cursor x
    let icy = 0; // initial cursor y
    let iw = 0; // initial target width
    let ih = 0; // initial target height
    let dragLocked = true; // prevent dragging on accident
    const dragThreshold = -1; // disable if -1
    let rX = false; let rY = false;
    let cX = true; let cY = true;

    // reactive
    $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent].style : $collection[$selectedComponent].styleOverrides[$selectedOverride].style;
    $: currentComponent = $collection[$selectedComponent];
    $: currentOverride = $selectedOverride !== -1 ? $collection[$selectedComponent].styleOverrides[$selectedOverride] : undefined;

    const startCornerDrag = (e:MouseEvent, revX:boolean, revY:boolean, changeX:boolean, changeY:boolean) => {
        // set icx and icy to current mouse position
        icx = e.clientX;
        icy = e.clientY;

        // set iw and ih to current component width / height
        if($selectedOverride !== -1){
            if(!currentOverride.style["width"]) currentOverride.style["width"] = {v:100,u:"px"};
            iw = currentOverride.style["width"].v;
            
            if(!currentOverride.style["height"]) currentOverride.style["height"] = {v:100,u:"px"};
            ih = currentOverride.style["height"].v;
        } else {
            if(!currentComponent.style["width"]) currentComponent.style["width"] = {v:100,u:"px"};
            iw = currentComponent.style["width"].v;
            if(!currentComponent.style["height"]) currentComponent.style["height"] = {v:100,u:"px"};
            ih = currentComponent.style["height"].v;
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
            if(!currentOverride.style["marginTop"]) currentOverride.style["marginTop"] = {v:0,u:"px"};
            imt = currentOverride.style["marginTop"].v;
        }else{
            if(!currentComponent.style["marginTop"]) currentComponent.style["marginTop"] = {v:0,u:"px"};
            imt = currentComponent.style["marginTop"].v;
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
        // set imt
        if($selectedOverride !== -1){
            if(!currentOverride.style["marginBottom"]) currentOverride.style["marginBottom"] = {v:0,u:"px"};
            imb = currentOverride.style["marginBottom"].v;
        }else{
            if(!currentComponent.style["marginBottom"]) currentComponent.style["marginBottom"] = {v:0,u:"px"};
            imb = currentComponent.style["marginBottom"].v;
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
        if($selectedOverride !== -1){
            if(!currentOverride.style["marginRight"]) currentOverride.style["marginRight"] = {v:0,u:"px"};
            imr = currentOverride.style["marginRight"].v;
        }else{
            if(!currentComponent.style["marginRight"]) currentComponent.style["marginRight"] = {v:0,u:"px"};
            imr = currentComponent.style["marginRight"].v;
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
        if($selectedOverride !== -1){
            if(!currentOverride.style["marginLeft"]) currentOverride.style["marginLeft"] = {v:0,u:"px"};
            iml = currentOverride.style["marginLeft"].v;
        }else{
            if(!currentComponent.style["marginLeft"]) currentComponent.style["marginLeft"] = {v:0,u:"px"};
            iml = currentComponent.style["marginLeft"].v;
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

</script>

<main>
    <!-- size handlers -->
    <div class="corner-drag" id="corner-tl" on:mousedown={e => startCornerDrag(e, false, false, true, true)}></div>
    <div class="corner-drag" id="corner-tm" on:mousedown={e => startCornerDrag(e, false, false, false, true)}></div>
    <div class="corner-drag" id="corner-tr" on:mousedown={e => startCornerDrag(e, true, false, true, true)}></div>
    <div class="corner-drag" id="corner-ml" on:mousedown={e => startCornerDrag(e, false, false, true, false)}></div>
    <div class="corner-drag" id="corner-mr" on:mousedown={e => startCornerDrag(e, true, false, true, false)}></div>
    <div class="corner-drag" id="corner-bl" on:mousedown={e => startCornerDrag(e, false, true, true, true)}></div>
    <div class="corner-drag" id="corner-bm" on:mousedown={e => startCornerDrag(e, false, true, false, true)}></div>
    <div class="corner-drag" id="corner-br" on:mousedown={e => startCornerDrag(e, true, true, true, true)}></div>

    <!-- margin resizers -->
    <!-- top -->
    <div class="vert-margins" id="top" style={`
        transform: translate3d(0,calc(${-cMT}${cMTu} + ${-cBT}${cBTu}),0); min-width:min(${cML}${cMLu}, ${cMR}${cMRu}); opacity:${cMT < 1 ? 0 : 0.2}
        `} on:mousedown={startMTDrag}><div></div></div>
    <!-- right -->
    <div class="hori-margins" id="right" style={`
        transform: translate3d(calc(${cMR}${cMRu} + ${cBR}${cBRu}),0,0); min-height:min(${cMT}${cMTu}, ${cMB}${cMBu}); opacity:${cMR < 1 ? 0 : 0.2}
        `} on:mousedown={startMRDrag}><div></div></div>
    <!-- bottom -->
    <div class="vert-margins" id="bottom" style={`
        transform: translate3d(0,calc(${cMB}${cMBu} + ${cBB}${cBBu}),0); min-width:min(${cML}${cMLu}, ${cMR}${cMRu}); opacity:${cMB < 1 ? 0 : 0.2}
        `} on:mousedown={startMBDrag}><div></div></div>
    <!-- left -->
    <div class="hori-margins" id="left" style={`
        transform: translate3d(calc(${-cML}${cMLu} + ${-cBL}${cBLu}),0,0); min-height:min(${cMT}${cMTu}, ${cMB}${cMBu}); opacity:${cML < 1 ? 0 : 0.2}
        `} on:mousedown={startMLDrag}><div></div></div>
</main>

<style lang="scss">
    @import "../../../../public/guideline";

    main{
        $pad-size: 40px;

        width:100%; height:100%;
        position: absolute;
        background: none;
        display:flex; flex-direction: column; justify-content: center; align-items: center;
        padding: $pad-size;
        transform: translate3d(-$pad-size, -$pad-size, 0);
        pointer-events: all;
        z-index: 100;

        &:active{
            .vert-margins, .hori-margins{
                opacity: 1 !important;
                background-color: $accent;
            }
        }

        &:hover, &:active{
            .corner-drag{
                opacity: 1;
            }
            // background-color: hsla(200,5%,8%,70%);
        }
    
        .corner-drag{
            min-width: 7px; min-height: 7px; max-width: 7px; max-height: 7px;
            background-color: $secondarys6;
            position: absolute;
            z-index: 1;
            opacity: 0;
            transition: opacity ease 100ms;
            box-shadow: 0 1px 5px hsla(0,0%,0%,75%);

            &#corner-tl{
                top: calc(-3.5px / 2) + $pad-size;
                left: calc(-3.5px / 2) + $pad-size;
                z-index:2;
                cursor: nwse-resize;
            }
            &#corner-tm{
                top: calc(-3.5px / 2) + $pad-size;
                cursor: ns-resize;
                z-index:1
            }
            &#corner-tr{
                top: calc(-3.5px / 2) + $pad-size;
                right: calc(-3.5px / 2) + $pad-size;
                z-index:2;
                cursor: nesw-resize;
            }
            &#corner-ml{
                left: calc(-3.5px / 2) + $pad-size;
                cursor: ew-resize;
                z-index:1
            }
            &#corner-mr{
                right: calc(-3.5px / 2) + $pad-size;
                cursor: ew-resize;
                z-index:1
            }
            &#corner-bl{
                bottom: calc(-3.5px / 2) + $pad-size;
                left: calc(-3.5px / 2) + $pad-size;
                z-index:2;
                cursor: nesw-resize;
            }
            &#corner-bm{
                bottom: calc(-3.5px / 2) + $pad-size;
                cursor: ns-resize;
                z-index:1
            }
            &#corner-br{
                bottom: calc(-3.5px / 2) + $pad-size;
                right: calc(-3.5px / 2) + $pad-size;
                z-index:2;
                cursor: nwse-resize;
            }
        }

        .vert-margins{
            width: calc(90% - $pad-size * 2); height:1px;
            cursor:ns-resize;
            position:absolute;
            pointer-events: all;
            background-color: $secondary;
            transition: opacity ease 100ms background-color ease 100ms;
            
            &:hover, &:active{
                background-color: $accent;
                opacity: 1 !important;
            }

            &::before{
                content:"";
                width: 100%; height:10px;
                cursor:ns-resize;
                position:absolute;
                pointer-events: all;
                background: none;
                transform: translate3d(0,-5px,0);
            }
        }
        .hori-margins{
            width: 1px; height: calc(90% - $pad-size * 2);
            cursor:ew-resize;
            position:absolute;
            pointer-events: all;
            background-color: $secondary;
            transition: opacity ease 100ms background-color ease 100ms;
            
            &:hover, &:active{
                background-color: $accent;
                opacity: 1 !important;
            }

            &::before{
                content:"";
                width: 10px; height:100%;
                cursor:ew-resize;
                position:absolute;
                pointer-events: all;
                background: none;
                transform: translate3d(-5px,0,0);
            }
        }

        #top{
            top: $pad-size;
        }
        #bottom{
            bottom: $pad-size;
        }
        #right{
            right:$pad-size;
        }
        #left{
            left:$pad-size;
        }
    }
</style>