<!-- 
     _   _  ____ _______ ______ 
    | \ | |/ __ \__   __|  ____|
    |  \| | |  | | | |  | |__   
    | . ` | |  | | | |  |  __|  
    | |\  | |__| | | |  | |____ 
    |_| \_|\____/  |_|  |______|
    
    This code is based on tarb's svelte-dnd-list at https://github.com/tarb/svelte-dnd-list
    If you are the author and have issues with copyrights, please contact me at lemon@thelemonorange.com
 -->

<svelte:options immutable={true} accessors={true} />

<script context="module">const ZONE_ATTR = 'data-dnd-zone';
const ZONE_SELECTOR = `[${ZONE_ATTR}]`;
const HANDLE_SELECTOR = '[data-dnd-handle]';
const DRAG_TOLERANCE = 5; //px
const dropzones = new Array();
let click = undefined;
let active = undefined;
let raf; // animation frame
const dragging = writable(undefined);
</script>

<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import { Direction, EventType } from 'svelte-dnd-list/types';
    import { writable } from 'svelte/store';
    import Element from "../CollectionViewer/Element.svelte";
    import Override from "../CollectionViewer/Override.svelte";
    import { collection, focusedComponent, selectedComponent, selectedOverride, focusedOverride } from "../../../stores/collection";
    import { HTMltagInfo } from '../../../types/general';
    import { clearColorPickerRef } from "../../../stores/colorPickerStat";

    export let id;
    export let itemCount;
    export let itemSize;
    export let type;
    export let priority = 1;
    export let itemClass = '';
    export let zoneClass = '';
    export let useHandle = false;
    export const dropzone = new type(id, priority, itemCount, itemSize);

    export let layerHeight = 0;
    export let containerWidth = 0;

    const dispatch = createEventDispatcher();
    let items = new Array(itemCount);
    $: dropzone.id = id;
    $: itemStyle = `${dropzone.direction === Direction.Vertical ? 'height' : 'width'}: ${itemSize}px;`;
    $: if (itemCount != dropzone.count || itemSize !== dropzone.itemSize) {
        dropzone.count = itemCount;
        dropzone.itemSize = itemSize;
        items = new Array(itemCount);
        if (dropzone.el) {
            dropzone.styleContainerBaseStyle();
        }
    }
    onMount(() => {
        dropzone.styleContainerBaseStyle();
        dropzones.push(dropzone);
        dropzones.sort((a, b) => b.priority - a.priority);
        return () => {
            dropzones.splice(dropzones.findIndex((dz) => dz === dropzone), 1);
        };
    });
    function findDropZone(x, y) {
        const el = document.elementFromPoint(x, y)?.closest(ZONE_SELECTOR); // this code uses the document element from point, which means that it will work even with different heights on elements, and we can vary the element height as we need.
        return el ? dropzones.find(dz => dz.el === el) : undefined;
        // const els = document.elementsFromPoint(x, y);
        // const el = els.find(e => e.getAttribute('data-dnd-zone') !== null);
        // return el !== undefined ? dropzones.find(dz => dz.el === el) : undefined;
    }
    function onMouseDown(e, index) {
        if (e.button !== 0 ||
            (useHandle && e.target.closest(HANDLE_SELECTOR) === null)) {
            return;
        }
        document.addEventListener('mousemove', onMouseDrag);
        document.addEventListener('mouseup', onMouseDragEnd);

        onDown({ pageX: e.pageX, pageY: e.pageY }, index);
    }
    function onTouchDown(e, index) {
        if (useHandle && e.target.closest(HANDLE_SELECTOR) === null) {
            return;
        }
        document.addEventListener('touchmove', onTouchDrag);
        document.addEventListener('touchend', onTouchDragEnd);
        onDown({ pageX: e.touches[0].pageX, pageY: e.touches[0].pageY }, index);
    }
    function onDown({ pageX, pageY }, index) {
        const el = dropzone.items[index];
        // set dropzone's current dragging element
        dropzone.currentDragEl = el;
        const br = el.getBoundingClientRect();
        click = {
            el,
            initPageX: pageX,
            initPageY: pageY,
            sourceIndex: index,
            dragLeft: pageX - br.left,
            dragTop: pageY - br.top,
            sourceZone: dropzone
        };
    }
    function onMouseDrag(e) {
        e.preventDefault();
        onDrag(e);
    }
    function onTouchDrag(e) {
        onDrag({
            pageX: e.touches[0].pageX,
            pageY: e.touches[0].pageY
        });
    }
    function onDrag({ pageX, pageY }) {
        if (active === undefined &&
            (Math.abs(pageX - click.initPageX) > DRAG_TOLERANCE ||
                Math.abs(pageY - click.initPageY) > DRAG_TOLERANCE)) {
            if (active) {
                finalizeDrag();
            }
            const placeholder = document.createElement('div');
            placeholder.style.cssText = dropzone.placeholderStyleStr();
            placeholder.setAttribute('data-dnd-placeholder', '');
            dropzone.el.appendChild(placeholder);
            active = {
                type: EventType.User,
                el: click.el,
                placeholder,
                resetZones: new Set([dropzone]),
                sourceIndex: click.sourceIndex,
                hoverIndex: undefined,
                sourceZone: click.sourceZone,
                destZone: dropzone,
                dragLeft: click.dragLeft,
                dragTop: click.dragTop,
                onMoveResolve: undefined
            };
            $dragging = active; // reactive value
            click = undefined;
            document.body.style.cursor = 'grabbing';
        }
        if (active) {
            if (raf)
                cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                raf = undefined;
                const drag = active;
                const { el, sourceZone, sourceIndex, dragLeft, dragTop } = drag;
                const tx = pageX - dragLeft;
                const ty = pageY - dragTop;
                let dest = findDropZone(pageX, pageY);
                if (dest === sourceZone) {
                    // same zone reorder
                    // style the dragging element
                    const enteredZone = dest !== drag.destZone;
                    // first render into this dropzone lets tidy up the last dropzone
                    if (enteredZone) {
                        if (drag.destZone !== undefined) {
                            drag.destZone.styleDestReset();
                        }
                    }
                    const hoverIndex = dest.pointIndex(pageX, pageY);
                    if (hoverIndex !== drag.hoverIndex || enteredZone) {
                        dest.styleSourceMove(hoverIndex, sourceIndex, drag.hoverIndex !== undefined);
                        active = {
                            ...active,
                            hoverIndex: hoverIndex,
                            destZone: dest
                        };
                        $dragging = active;
                    }
                    el.style.cssText = `position: fixed;
                            top: 0;
                            left: 0;
                            z-index:1000;
                            pointer-events:none;
                            cursor:grabbing;
                            transition:height 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000), width 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000); position:fixed; transform:translate(${tx}px,${ty}px)`;
                }
                else {
                    // new zone
                    const enteredZone = dest !== drag.destZone;
                    // first render into this dropzone (or out of if dest = undefined)
                    // lets tidy up the last dropzone
                    if (enteredZone) {
                        // source zone needs to render collapsing the missing item
                        if (drag.destZone === sourceZone) {
                            drag.destZone.styleSourceMissing(sourceIndex);
                            // other zones can just render back to normal
                        }
                        else if (drag.destZone !== undefined) {
                            drag.destZone.styleDestReset();
                        }
                    }
                    if (dest !== undefined) {
                        // style the dragging element - it keeps its source dimensions as its not inside a drop zone
                        // lets increase this containers size on first render to hold the new
                        // item where hovering over it
                        if (enteredZone) {
                            // market this zone as needing style reseting a zone might be dragged
                            // over without, a drop, making it neither src or dest zone we still
                            // want to tidy up the styles we leave behind on dragend tho
                            drag.resetZones.add(dest);
                        }
                        // and adjust the styles of the items and update dragging
                        const hoverIndex = dest.pointIndex(pageX, pageY);
                        if (hoverIndex !== drag.hoverIndex || enteredZone) {
                            dest.styleDestMove(hoverIndex);
                            active = {
                                ...active,
                                hoverIndex: hoverIndex,
                                destZone: dest
                            };
                            $dragging = active;
                        }
                        el.style.cssText = `position: fixed; top: 0; left: 0; z-index:1000; pointer-events: none; cursor:grabbing; position:fixed; transition: height 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000); transform:translate(${tx}px,${ty}px); transition:height 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000), width 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000);`;
                    }
                    else {
                        // style the dragging element - it keeps its source dimensions as its not inside a drop zone
                        // first render out of a dropzone, update dragging
                        if (enteredZone) {
                            active = {
                                ...active,
                                hoverIndex: -1,
                                destZone: undefined
                            };
                            $dragging = active;
                        }
                        el.style.cssText = `position: fixed; top: 0; left: 0; z-index:1000; pointer-events:none; cursor:grabbing; position:fixed; transform:translate(${tx}px,${ty}px); transition:height 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000), width 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000);`;
                    }
                }
            });
        }
    }
    function onMouseDragEnd(e) {
        document.removeEventListener('mousemove', onMouseDrag);
        document.removeEventListener('mouseup', onMouseDragEnd);
        if (!active) {
            return;
        }
        onDragEnd();
    }
    function onTouchDragEnd(e) {
        document.removeEventListener('touchmove', onTouchDrag);
        document.removeEventListener('touchend', onTouchDragEnd);
        if (!active) {
            return;
        }
        onDragEnd();
    }
    function onDragEnd() {
        if (raf) {
            cancelAnimationFrame(raf);
        }
        const { el, destZone, sourceZone, sourceIndex } = active;
        const hoverIndex = active.hoverIndex ?? sourceIndex;
        document.body.style.cursor = '';
        el.addEventListener('transitionend', finalizeDrag);
        let tx, ty, height, width, forceFinal = false;
        if (destZone === sourceZone) {
            let widthLastOffset = 0;
            let heightLastOffset = 0;
            const { count, direction } = sourceZone;
            if (hoverIndex === count) {
                if (direction === Direction.Vertical) {
                    heightLastOffset = -1;
                }
                else if (direction === Direction.Horizontal) {
                    widthLastOffset = -1;
                }
            }
            tx = sourceZone.dragXOffset(hoverIndex + widthLastOffset);
            ty = sourceZone.dragYOffset(hoverIndex + heightLastOffset);
            height = sourceZone.itemHeight();
            width = sourceZone.itemWidth();
            // detect when a transitionEnd event wont fire as the transition is already in the
            // finishing position
            forceFinal =
                el.style.transform === `translate(${tx}px, ${ty}px)` || el.style.transform === '';
        }
        else if (destZone !== undefined) {
            tx = destZone.dragXOffset(hoverIndex, destZone.count + 1);
            ty = destZone.dragYOffset(hoverIndex, destZone.count + 1);
            height = destZone.itemHeight();
            width = destZone.itemWidth();
        }
        else {
            tx = sourceZone.dragXOffset(sourceIndex);
            ty = sourceZone.dragYOffset(sourceIndex);
            height = sourceZone.itemHeight();
            width = sourceZone.itemWidth();
            sourceZone.styleSourceMove(sourceIndex, sourceIndex, true);
        }
        el.style.cssText = `position: fixed; top: 0; left: 0; z-index:1000; position:fixed; transform:translate(${tx}px,${ty}px); transition:transform 300ms cubic-bezier(0.2,0,0,1), height 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000), width 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000);`;
        // if a force was detected as needed, fire it off here
        if (forceFinal) {
            finalizeDrag();
        }
    }
    function finalizeDrag(ev) {
        const { el, destZone, sourceZone, sourceIndex, resetZones, placeholder } = active;
        const hoverIndex = active.hoverIndex ?? sourceIndex; // if no drag action took place hover may be undef
        
        // we will reassign focus and select element index here. If hoverIndex is -1, we don't need to change anything
        if(hoverIndex !== -1){
            $selectedComponent = hoverIndex;
            $focusedComponent = hoverIndex;
        }
        
        if (ev && ev.target !== el) {
            return;
        }
        if (raf)
            cancelAnimationFrame(raf);
        raf = undefined;
        const from = {
            dropZoneID: sourceZone.id,
            index: sourceIndex
        };
        const to = destZone
            ? destZone === sourceZone && hoverIndex === sourceIndex
                ? from
                : { dropZoneID: destZone.id, index: hoverIndex }
            : undefined;
        dispatch('drop', { from, to });
        if (placeholder) {
            sourceZone.el.removeChild(placeholder);
        }
        resetZones.forEach((zone) => zone.styleRemove());
        el.removeEventListener('transitionend', finalizeDrag);
        active.onMoveResolve?.();
        active = undefined;
        $dragging = undefined;
    }
    export async function move(srcIndex, destIndex, destZone, transitionDur = 500) {
        return new Promise((resolve, reject) => {
            if (active !== undefined) {
                resolve();
                return;
            }
            const el = dropzone.items[srcIndex];
            if (!el) {
                resolve();
                return;
            }
            // initial style for begining of element transition
            {
                const tx = dropzone.dragXOffset(srcIndex);
                const ty = dropzone.dragYOffset(srcIndex);
                const height = dropzone.itemHeight();
                const width = dropzone.itemWidth();
                el.style.cssText = `z-index:1000; height:${height}px; width:${width}px; position:fixed; transform:translate(${tx}px,${ty}px)`;
            }
            // style the containers
            dropzone.styleSourceMove(srcIndex, srcIndex, false);
            if (destZone !== dropzone) {
                setTimeout(() => {
                    active?.type === EventType.Programatic && dropzone.styleSourceMissing(srcIndex);
                }, transitionDur * 0.4);
                destZone.styleDestMove(destIndex);
            }
            else {
                setTimeout(() => {
                    active?.type === EventType.Programatic &&
                        dropzone.styleSourceMove(destIndex, srcIndex, true);
                }, transitionDur * 0.25);
            }
            active = {
                type: EventType.Programatic,
                el,
                placeholder: undefined,
                resetZones: new Set([dropzone, destZone]),
                sourceIndex: srcIndex,
                hoverIndex: destIndex,
                sourceZone: dropzone,
                destZone: destZone,
                dragLeft: 0,
                dragTop: 0,
                onMoveResolve: resolve
            };
            $dragging = active;
            // style the moving element, to its final position/transition
            {
                const tx = destZone.dragXOffset(destIndex, destZone.count + 1);
                const ty = destZone.dragYOffset(destIndex, destZone.count + 1);
                const height = destZone.itemHeight();
                const width = destZone.itemWidth();
                el.addEventListener('transitionend', finalizeDrag);
                el.style.cssText = `
                    z-index: 1000; 
                    position: fixed; 
                    top:0; left: 0;
                    height: ${height}px; 
                    width: ${width}px; 
                    transform: translate(${tx}px,${ty}px); 
                    transition:
                        transform ${transitionDur}ms cubic-bezier(0.215, 0.610, 0.355, 1.000), 
                        height ${transitionDur}ms cubic-bezier(0.215, 0.610, 0.355, 1.000), 
                        width ${transitionDur}ms cubic-bezier(0.215, 0.610, 0.355, 1.000);`;
            }
        });
    }
    const updateElList = () => {
        // I don't know why the fuck this works but it somehow does
        try {
            onDrag({pageX: 0, pageY: 0});
            onDragEnd();
        } catch (error) {
            // do nothing, the comp just haven't loaded fully yet
        }
    }
    const deselElement = (e) => {
        if(e.target === e.currentTarget){ // detect only parent clicks
            $selectedComponent = $selectedOverride = $focusedComponent = $focusedOverride = -1;
            
            // clear color ref because it may cause UX issues
            clearColorPickerRef();
        }
    }
</script>

<div data-dnd-zone on:mousedown={deselElement} class={`${zoneClass} ${dropzone.containerClass}`} bind:this={dropzone.el}>
	{#each $collection as _, i (_.type)}
		<div
			data-dnd-item
			data-dnd-dragging={(active?.sourceIndex === i && active?.sourceZone.id === id) || $dragging === null ? true : undefined}
			class={itemClass}
            id={`ce812145-67d2-440c-8fdd-510b909e7d8d-${i}`}
			style={itemStyle}
			bind:this={dropzone.items[i]}
			on:mousedown={(e) => onMouseDown(e, i)}
			on:touchstart={(e) => onTouchDown(e, i)}
		>
            <Element tagType={_.type} elmntIndex={i} height={layerHeight} width={containerWidth-20} iconURI={HTMltagInfo[_.type].iconURI} on:updateElList={updateElList}/>
            
            {#if !!$collection[i].styleOverrides && $collection[i].showing}
                <section class="overrideContainer">
                    {#each $collection[i].styleOverrides as override, j (j)}
                        <Override height={layerHeight} elmntIndex={i} overrideIndex={j} />
                    {/each}
                </section>
            {/if}
		</div>
	{/each}
</div>

<style>div[data-dnd-zone] {
    display: flex;
    position: relative;
    height: 100%;
    max-width: calc(100% - 10px);
}
div[data-dnd-zone].horizontal {
    flex-direction: row;
}
div[data-dnd-zone].vertical {
    flex-direction: column;
}
div[data-dnd-zone].center.horizontal div[data-dnd-item]:first-child, div[data-dnd-zone].center.horizontal div[data-dnd-item][data-dnd-dragging]:first-child + * {
    margin-left: auto;
}
div[data-dnd-zone].center.horizontal div[data-dnd-item]:last-child {
    margin-right: auto;
}
div[data-dnd-zone].center.horizontal :global(div[data-dnd-placeholder]:first-child) {
    margin-left: auto;
}
div[data-dnd-zone].center.horizontal :global(div[data-dnd-placeholder]:last-child) {
    margin-right: auto;
}
div[data-dnd-zone] :global(div[data-dnd-placeholder]) {
    flex-shrink: 0;
    flex-grow: 0;
}

div[data-dnd-item] {
  position: relative;
  user-select: none;
  touch-action: none;
  flex-shrink: 0;
  flex-grow: 0;
}

:global(*[data-dnd-handle]) {
  cursor: grab !important;
}</style>
