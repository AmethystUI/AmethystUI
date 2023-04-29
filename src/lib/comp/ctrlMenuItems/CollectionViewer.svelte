<script lang="ts">
    import Element from "./CollectionViewer/Element.svelte";
    import { collection, selectedComponent, selectedOverride, focusedComponent, focusedOverride } from "$lib/stores/collection";
    import ComponentList from "./DragDropList/ComponentList.svelte";
    import VerticalDropZone from "./DragDropList/VerticalDropZone"

    import { reorder, type DropEvent } from 'svelte-dnd-list';
    
    export let containerWidth:number;

    function onDrop({ detail: { from, to } }: CustomEvent<DropEvent>) {
		if (!to || from === to) {
			return;
		}

		$collection = reorder($collection, from.index, to.index);
	}

    const deselElement = (e:MouseEvent) => {
        if(e.target === e.currentTarget){ // detect only parent clicks
            $selectedComponent = $selectedOverride = $focusedComponent = $focusedOverride = -1;
        }
    }

    const layerHeight = 35; // px
</script>

<main on:mousedown={deselElement}>
<!-- <div class="deselection-zone"></div> -->
<!-- Item size is preally useless, but if I remove it the whole thing breaks for the some reason -->
<ComponentList
    id="componentList"
    type={VerticalDropZone}
    itemSize={45}
    itemCount={$collection.length}
    layerHeight={layerHeight}
    containerWidth={containerWidth}
    on:drop={onDrop}/>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    main{
        width:calc(100% - 10px); height:calc(100vh - 65px - 20px);
        display: flex; flex-direction: column; align-items: flex-start;
        padding: 10px 0px 0px 10px;
        overflow-y: auto; overflow-x:hidden;
        overflow: -moz-scrollbars-none;

        // hide scrollbar
        // &::-webkit-scrollbar { width: 0 !important }
    }
</style>