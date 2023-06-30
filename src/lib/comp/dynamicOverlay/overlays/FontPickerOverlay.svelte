<!-- This is the overlay module that can be used with the Overlay component -->

<!-- control functions for the overlay -->
<script lang="ts" context="module">
    import { openOverlayFrame } from "../DynamicOverlay.svelte";
    import { mainFontPickerData } from "$lib/stores/fontPickerManager";
    import { initializeMainFontPickerData, storedFontData } from "$lib/stores/fontStorageManager";
    import { beautifiedFontName, fontExtensionToFormats, getClosestVariation, getFontNameValue, searchFontIndex } from "$lib/workers/pseudoWorkers/fonts";

    const componentID = crypto.randomUUID();

    const sessionStorageKey = "fonts";

    let fontListContainer: HTMLElement;

    /**
     * Opens the color picker as well as the overlay frame and sets the color reference and name.
     * 
     * @param {string} propertyRef - The color reference to set.
     * @param {string} propertyName - The name of the color reference.
     * @param {HTMLElement} trackTarget - The element to track positionally. Tracking behavior is determined by props.showInlineHSL
     * @property {boolean} trackContinuously - Whether to track the element continuously (Default true).
     * @property {boolean} showInlineHSL - Whether to show the inline HSL values  (Default false).
     */
    export function openFontPicker(propertyRef:string, propertyName:string, trackTarget: HTMLElement | Element, props={
        trackContinuously: true
    }){
        // setColorPickerRef(propertyRef); // set the font reference
        mainFontPickerData.update(pickerDat => { // update the picker
            pickerDat.refName = propertyRef; // update font reference
            pickerDat.windowName = propertyName; // update font name
            return pickerDat;
        });

        // fetch font files (only if there is no font file). DO NOT REMOVE THE IF STATEMENT! OTHERWISE THE DATA WILL RESET!!!
        if(get(storedFontData).currentFontContent.length === 0 || get(storedFontData) === undefined){
            initializeMainFontPickerData(sessionStorageKey).catch(err => {
                console.error("Failed to cache and load font > ", err);
            });
        }

        // open the overlay frame
        openOverlayFrame(trackTarget, updateOverlaySize, componentID, props.trackContinuously, FontPickerOverlay);  
    }


    // ======================== NON EXPORTABLES ========================

    // track if drag is locked or not to update our overlay sizing. We only want to update something when it's necessary
    // also track visible because hiding and showing it is weird
    let dragLocked = get(mainDoverlayData).dragLocked;
    let lastDragLocked = get(mainDoverlayData).dragLocked;
    let visible = get(mainDoverlayData).visible;
    let lastVisible = get(mainDoverlayData).visible;

    let mainContainer:HTMLElement;
    let mainTitleContainer:HTMLElement;

    // these configure the sizing of the window. Manually configure them for now cuz I can't be bothered to write detection code
    let normalOverlayWidth = 650;
    let normalOverlayHeight = 297;
    let titleHeight = 25;

    let targetHeight = normalOverlayHeight;
    let targetWidth = normalOverlayHeight;
    let targetCursorOffset = 0;

    let globalContentYOffset = 13;
    let targetYOffset = globalContentYOffset;
    let contentYOffset = tweened(targetYOffset, {
        duration: 500,
		easing: cubicOut
    }); // controls how much the content is moved down. Update with height changes

    /**
     * This is an object that maps the alignment values to a certain index.
     * It helps in easily identifying the position of the element on the component UI.
     * Every component might have a different alignmentIndicies object. This one is exclusive to this component.
     */
    const alignmentIndices: { [K in textAlignment]: number } = {
        "left": 0,
        "center": 1,
        "right": 2,
        "justify": 3,
    };
    const casingIndices: { [K in textCasing]: number } = {
        "lowercase": 0,
        "none": 1,
        "uppercase": 2,
    };
    const decorationIndices: { [K in textDecoration]: number } = {
        "italicize": 0,
        "underline": 1,
        "strike": 2,
    };

    /**
     * This fucntion handle all size changes for the element. Normally, the overlay size will only update if it's closed. However, this can be changed if forceUpdate is set to true.
     * 
     * @param forceUpdate - force the update regardless of overlay visibility
     */ 
     const updateOverlaySize = (forceUpdate = false) => { // we can forcefully override and update anyways
        setTimeout(() => { // set time out here so that elements have a chance to load
            // we only want to run when there's a change in drag and last dragged, or when an override is called
            dragLocked = get(mainDoverlayData).dragLocked;
            visible = get(mainDoverlayData).visible;
    
            // the element checking basically ensures there's something to update
            if(dragLocked === lastDragLocked && visible === lastVisible && !!mainContainer){
                if(!forceUpdate) return;
            }
    
            // code starts executing here, if there is a change between dragLocked
    
            // If the update isn't an override, really only these code should be executed
            mainDoverlayData.update(overlayDat => {overlayDat.w = normalOverlayWidth; return overlayDat});
    
            // these determine how to update the sizing based on the mode
            if(!!dragLocked){ // how to update the overlay when it's dragged out
                targetHeight = normalOverlayHeight + titleHeight;
                targetCursorOffset = titleHeight/2;
    
                // unhide the title
                if(!!mainTitleContainer) mainTitleContainer.classList.remove("hidden");
                
                targetYOffset = globalContentYOffset + titleHeight/2;
            } else { // how to update the overlay when it's not dragged out
                targetHeight = normalOverlayHeight;
                targetCursorOffset = titleHeight/2;
    
                // hide the title
                if(!!mainTitleContainer) mainTitleContainer.classList.add("hidden");
    
                targetYOffset = globalContentYOffset;
            }
    
            // update values
            mainDoverlayData.update(overlayDat => {
                overlayDat.h = targetHeight;
                overlayDat.cursorOffsetY = targetCursorOffset;
                return overlayDat;
            });
            contentYOffset.set(targetYOffset);
    
            lastDragLocked = dragLocked;
            lastVisible = visible;
        }, 0);
    }
</script>

<!-- Fontpicker overlay backend -->
<script lang="ts">
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
    import FontPickerOverlay from "./FontPickerOverlay.svelte"; // this import causes circular dependency warning in the compiler, but it works for now. It might be an issue in the future, so keep an eye out on this line.
    
    import { collection, selectedComponent, selectedOverride } from "$lib/stores/collection";
    import { mainDoverlayData } from "$lib/stores/dynamicOverlayManager";
    import { get } from "svelte/store";
    import MultiSelect, { textDecoration, typeFilters } from "$lib/comp/ctrlMenuItems/StyleEditors/Basics/MultiSelect.svelte";
    import MultiToggle, { textAlignment, textCasing } from "$lib/comp/ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte";
    import UnitInput from "$lib/comp/ctrlMenuItems/StyleEditors/Basics/UnitInput.svelte";

    import LoadingSpinner from "../../ui/LoadingSpinner.svelte";
    import { onDestroy, onMount } from "svelte";
    import { downloadFontFromURLs, fontDBName, TTFObjectStore } from "$lib/workers/fontInstaller.worker";
    import type { fontBinary } from "$lib/workers/fontInstaller.worker";
    import { openDB as openDBWithIDB } from "idb";
    import type { IDBPDatabase, IDBPObjectStore, IDBPTransaction } from "idb"

    $: name = $mainFontPickerData.windowName ?? "Fonts";
    $: fontsItalisized = !!fontRef ? fontRef.textDecorations.includes("italicize") : false;
    $: fontsUnderlined = !!fontRef ? fontRef.textDecorations.includes("underline") : false;
    $: fontsStriked = !!fontRef ? fontRef.textDecorations.includes("strike") : false;
    
    let ready = false;
    let fontRef:typographyStyle;

    // This try catch tries to retrieve the specified color reference from $collection.
    // If such reference exists, then we point our local colorRef to the $collection reference.
    // If such reference does not exist or no longer exists, we will just duplicate the value we currently have so that the value can persist on and not reset itself.
    // If there is any error during checking or assigning, we can just reset everything for safety.
    
    $: try { // only try to update the reference if the active elemnt ID matches the current one
        if ($mainFontPickerData.refName && $selectedComponent !== -1) {
            if ($selectedOverride !== -1) {
                fontRef = $collection[$selectedComponent].styleOverrides[$selectedOverride].style[$mainFontPickerData.refName]; // there is an overlay, so choose the overlay style
            } else {
                fontRef = $collection[$selectedComponent].style[$mainFontPickerData.refName];  // there is no overlay, so choose the root style
            }
        } else {
            fontRef = {...fontRef}; // persistence of fonts even after reference is cleared
        }
    } catch (error) {
        // if there is an error, just reset the overlay because it's probably due to some bad timing between the layers and the picker
        $mainFontPickerData.refName = undefined;
        $mainFontPickerData.windowName = "Typography";
    }

    // ====================== ON MOUNT ======================

    let selectedFontIndex = 0;
    let focusedTypefaceIndex;

    // We'll be mainly using the filtered font content
    let roughFilteredFontContent: fontObject[] = [...$storedFontData.currentFontContent]; // for processing type categories
    let fineFilteredFontContent: fontObject[] = [...roughFilteredFontContent];  // for processing font queries

    onMount(async () => {
        // search for font first
        focusedTypefaceIndex = selectedFontIndex = await searchFontIndex(fineFilteredFontContent, fontRef.fontObj.family);

        // open DB first
        await openDB();

        // Increase preview loading load after the first render is complete
        await loadNecessaryFontPreview(true, 15, selectedFontIndex);

        let intID = setInterval(() => {
            // set ready to true
            ready = true;
            
            // set the scroll position to the selection in the font pickers. The conatiner might not come instantly, so we need to wait for it to be ready
            if(!!fontListContainer){
                fontListContainer.scrollTop = selectedFontIndex * 35 - 95;
                // cancel interval
                clearInterval(intID);
            }
        }, 1);
    })

    onDestroy(() => {
        $mainFontPickerData.searchLocked = true;
        $mainFontPickerData.searchQuery = "";

        // kill DB connection
        db.close();
    })

    /**
     * Loads the necessary font preview based on the current scroll position, or from a specific index if specified.
     * 
     * @param {boolean} [forceLoad=false] Whether to force load the font preview, regardless of the current difference in scroll position.
     * @param {number} [loadLimit=15] The number of fonts to be loaded on either side of the focused font.
     * @param {number} [updateFromIndex=-1] The index of the font to update the preview from. If set to -1, the preview will be updated dynamically based on the current scroll position.
     * 
     * @returns {void}
     */
    const loadNecessaryFontPreview = async (forceLoad?:boolean, loadLimit = 30, updateFromIndex:number = -1) => {
        // DEV: ChatGPT says this code needs more error handling, but it works for now. It might be an issue in the future, so keep an eye out

        forceLoad = !!forceLoad;

        let scrollHeight: number;
        let newFocusdTypefaceIndex:number;

        if(updateFromIndex === -1 && !!fontListContainer) { // if we don't have a specific index to update from AND if the parent doesn't exist yet, then we'll dynamically update based off of scroll position
            scrollHeight = fontListContainer.scrollTop; // if no scroll height is specified, default to scroll top on the font container
            newFocusdTypefaceIndex = Math.round((scrollHeight + 95) / 35); // get the index of the font that is currently looked at (the center one)
        } else { // otherwise, we'll just the preview from the specified index
            newFocusdTypefaceIndex = updateFromIndex; // get the index of the font that is currently looked at (the center one)
        }
        
        // we'll only load previews when the difference in scroll is larger than 5 
        const dIndex = Math.abs(newFocusdTypefaceIndex - focusedTypefaceIndex);
        
        // only update the preview if it's significantly different from the last one or close to the edge, or if force load is set to true
        if(!forceLoad && (dIndex < 10 && (newFocusdTypefaceIndex < fineFilteredFontContent.length-10 && newFocusdTypefaceIndex > 10))) return;

        // if we should transcribe, we first update the focus index
        focusedTypefaceIndex = newFocusdTypefaceIndex;
        
        let URLKeys: string[] = []; // array of URL keys to retrieve
        let URLKeyToObject: Record<string, fontObject> = {}; // map of URL key to family name
        let currentIterFontObj: fontObject // the font object that we're currently iterating over

        // Fetch the font keys that still need to be loaded into CSS.
        for(let i = Math.max(0, focusedTypefaceIndex - loadLimit); i < Math.min(fineFilteredFontContent.length, focusedTypefaceIndex + loadLimit); i++) {
            /*
             * There are a few cases where we don't want to load the font:
             *  - The font is undefined
             *  - The font has already been loaded (trancribed)
             *  - The font is web safe
             *  - The font is our system font (Inter, Plus Jakarta Sans, Poppins, Fira Code)
             */
            currentIterFontObj = fineFilteredFontContent[i];
            if(!currentIterFontObj || currentIterFontObj.webSafe) continue;

            // if the font is valid for loading, get URL key based on variation closest to 400
            const variation = getClosestVariation(400, currentIterFontObj.variations);
            const variationIndex = currentIterFontObj.variations.indexOf(variation); // get the index of the variation closest to 400
            const URLkey = currentIterFontObj.fileURLs[variationIndex].url; // get the URL key for the variation closest to 400

            if(
                $storedFontData.transcribedFonts.has(URLkey) || 
                ["Inter", "Plus Jakarta Sans", "Poppins", "Fira Code"].includes(currentIterFontObj.family)
            ){
                continue;
            }
            
            // set transcribed to true so we dont retranscribe this shit
            $storedFontData.transcribedFonts.set(URLkey, null);

            URLKeys.push(URLkey); // add the URL key to the array of URL keys to retrieve
            URLKeyToObject[URLkey] = currentIterFontObj; // add the family name to the map of URL key to family name
        }

        // download any fonts that are not yet downloaded
        await downloadFontFromURLs(db, URLKeys);
        
        // open DB transaction so we can start loading the font data into DOM
        let tx: IDBPTransaction<unknown, ["TTF"], "readonly">;
        let store: IDBPObjectStore<unknown, ["TTF"], "TTF", "readonly">;

        try{
            tx = db.transaction(TTFObjectStore, "readonly");
            store = tx.objectStore(TTFObjectStore);
        } catch (error) {
            console.warn("Tried to update DB while DB is closing.");
            return;
        }

        // let fontFaceCSS = ""; // the css code
        let newStyle = document.createElement("style");

        // Loop through the keys and load the data into CSS
        for (let i = 0; i < URLKeys.length; i++) {
            const URLkey = URLKeys[i]; // get the URL key
            const fontObject = URLKeyToObject[URLkey]; // get the family name
            const variation = getClosestVariation(400, currentIterFontObj.variations);
            const fontBinaryObj = (await store.get(URLkey) as fontBinary); // get the blob object for the key;

            let blobURL: string;
            // see if we already have a local URL stored
            if(!!fontObject.localURLs){
                blobURL = fontObject.localURLs[variation].url ?? URL.createObjectURL(fontBinaryObj.binary);
                // update the local URLs object if we had to generate a new one
                if(!fontObject.localURLs[variation]) fontObject.localURLs[variation] = {
                    variation: variation,
                    url: blobURL
                }
            } else {
                blobURL = URL.createObjectURL(fontBinaryObj.binary);
                // initialize localURLs
                fontObject.localURLs = [];
                fontObject.localURLs[variation] = {
                    variation: variation,
                    url: blobURL
                }
            }

            const blobFormat = fontExtensionToFormats(fontBinaryObj.fileType); // get the file format;

            // Add fontface definition again

            newStyle.appendChild(document.createTextNode(`
            @font-face {
                font-family:"${fontObject.family}";
                font-weight:${variation};
                src:url(${blobURL}) format("${blobFormat}");
            }
            `));

        }

        // document.querySelector("#custom-font-faces").innerHTML += fontFaceCSS;
        document.head.appendChild(newStyle);

        // finish tx
        await tx.done;

        return;
    }

    /**
     * Downloads and loads font variations into the stylesheet for the specified font object.
     * 
     * @param {fontObject} fontObj - The font object to load variations for.
     * 
     * @returns {void}
     */
    const loadFontVariationPreview = async (fontObj: fontObject) => {
        if(fontObj === undefined || fontObj.webSafe) return; // if the font object is undefined or websafe, we don't need to do anything

        let loadURLs: variationURL[] = [];

        // loop through the files and add whatever needs to be loaded into our array
        for(let i = 0; i < fontObj.fileURLs.length; i++){
            /*
             * There are a few cases where we don't want to load the variations:
             *  - The variation has already been loaded (trancribed)
             *  - The variation is part of a family that is web safe
             *  - The variation is part of our system font (Inter, Plus Jakarta Sans, Poppins, Fira Code)
             */

            const currentVariation: variationURL = fontObj.fileURLs[i];

            if(
                $storedFontData.transcribedFonts.has(currentVariation.url) ||
                ["Inter", "Plus Jakarta Sans", "Poppins", "Fira Code"].includes(fontObj.family)
            ){
                continue; // do not this variation
            }

            loadURLs.push(currentVariation); // add the URL to the array of URLs to retrieve
            $storedFontData.transcribedFonts.set(currentVariation.url, null); // record this URL in our map so we don't retranscribe it
        }

        // download any variations necessary
        await downloadFontFromURLs(db, loadURLs.map(variation => variation.url));

        // load variations into the stylesheet
        const tx = db.transaction(TTFObjectStore, "readonly"); // open db transaction first
        const store = tx.objectStore(TTFObjectStore); // get the object store

        let fontFaceCSS = ""; // the css code

        // Loop through the keys and load the data into CSS
        for (let i = 0; i < loadURLs.length; i++) {
            const currentVariation = loadURLs[i]; // get the URL key
            const fontBinaryObj = (await store.get(currentVariation.url) as fontBinary); // get the blob object for the key;

            let blobURL: string;
            // see if we already have a local URL stored
            if(!!fontObj.localURLs){ // check if we have this list at all first
                blobURL = !!fontObj.localURLs[currentVariation.variation] ? fontObj.localURLs[currentVariation.variation].url : URL.createObjectURL(fontBinaryObj.binary);
                // update the local URLs object if we had to generate a new one
                if(!fontObj.localURLs[currentVariation.variation]) fontObj.localURLs[currentVariation.variation] = {
                    variation: currentVariation.variation,
                    url: blobURL
                }
            } else { // if this list doesn't exist, initialize it and create a new local URLs object
                blobURL = URL.createObjectURL(fontBinaryObj.binary);
                // initialize localURLs
                fontObj.localURLs = [];
                fontObj.localURLs[currentVariation.variation] = {
                    variation: currentVariation.variation,
                    url: blobURL
                }
            }

            const blobFormat = fontExtensionToFormats(fontBinaryObj.fileType); // get the file format
            // Add the URL to the stylesheet. We don't have to do a final check here because there's probably not gonna be many instances of this function running at the same time.

            fontFaceCSS += `
            @font-face {
                font-family:"${fontObj.family}";
                src:url(${blobURL}) format("${blobFormat}");
                font-weight:${currentVariation.variation};
            }
            `;
        }

        // Append the CSS to the DOM
        document.querySelector("#custom-font-faces").innerHTML += fontFaceCSS;

        // finish tx
        await tx.done;

        return;
    }

    // openDB and stuff
    let db:IDBPDatabase;

    const openDB = async () => {
        // check if the DB is already open by seeing if it holds a value
        if(!!db) return;

        // open the DB and store it to db;
        db = await openDBWithIDB(fontDBName, 1, {
            upgrade(db) {
                db.createObjectStore(TTFObjectStore); // setup db object store. We don't need a keypath as we'll specify it when putting data in
            },
        })
    }

    // ====================== UPDATE FUNCTIONS ======================
    
    const updateAlignment = (e:CustomEvent) => {
        const val = e.detail.value;
        // set the value of the alignment to the collection value
        fontRef.alignment = val;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }

    const updateCasing = (e:CustomEvent) => {
        const val = e.detail.value;
        // set the value of the alignment to the collection value
        fontRef.casing = val;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }

    const updateDecoration = (e:CustomEvent) => {
        // set the value of the decorations accordingly
        fontRef.textDecorations = e.detail.values;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }

    const updateTypeface = (newIndex: number) => {
        // update selected font index
        selectedFontIndex = newIndex;

        // lock search query and update query name
        $mainFontPickerData.searchLocked = true;
        
        // fetch the typeface name from the index
        const newFontObject: fontObject = fineFilteredFontContent[newIndex];
        fontRef.fontObj = newFontObject; // set the new typeface name
        
        // load preview for this new variation
        loadFontVariationPreview(newFontObject);

        // check to see if the new typeface supports the current variation. If not, switch variation to the closest match
        const newTypefaceVariations:number[] = newFontObject.variations; // the variations of the new typeface
        const currentVariation:number = fontRef.variation; // the variation on the last typeface selection
            
        // not every font supports a regular variant, so we have to find the closest match
        fontRef.variation = getClosestVariation(currentVariation, newTypefaceVariations);

        // update collection so that svelte can update the associated components
        $collection = $collection;
    }

    const updateVariation = (newVariation: number) => {
        fontRef.variation = newVariation;

        // update collection so that svelte can update the associated components
        $collection = $collection;
    }

    type sizeAttribute = "size" | "tracking" | "lineHeight"; // these correspond to the attributes thats stored in collection
    const updateTextSizing = (att: sizeAttribute, e: CustomEvent) => { // used for font size, tracking and line height only.
        fontRef[att].v = e.detail.v;
        fontRef[att].u = e.detail.u;
        // update collection so that svelte can update the associated components
        $collection = $collection;
    }

    // ========================== QUERY FILTERS ==========================

    const levenshteinDistance = (a:string, b:string): number => {
        const m = a.length;
        const n = b.length;
        const dp = new Array(m + 1);
    
        for (let i = 0; i <= m; i++) {
            dp[i] = new Array(n + 1);
            dp[i][0] = i;
        }
    
        for (let j = 1; j <= n; j++) {
            dp[0][j] = j;
        }
    
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (a[i - 1] === b[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(dp[i - 1][j - 1] + 1, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
                }
            }
        }
    
        return dp[m][n];
    }

    const fuzzySearch = (fontList: fontObject[], query: string): fontObject[] => {
        return fontList.sort((a, b) => {
            const aName = a.appearedName ? a.appearedName.toLowerCase() : a.family.toLowerCase();
            const bName = b.appearedName ? b.appearedName.toLowerCase() : b.family.toLowerCase();

            // We'll also take into account of the position of the query. The more infront it is, the smaller the weight
            const scoreA = levenshteinDistance(aName, query) + (aName.includes(query) ? aName.indexOf(query) : 999);
            const scoreB = levenshteinDistance(bName, query) + (bName.includes(query) ? bName.indexOf(query) : 999);
            return scoreA - scoreB;
        }).filter(item => {
            const itemName = item.appearedName ? item.appearedName.toLowerCase() : item.family.toLowerCase();

            try{
                const pattern = query.split("").reduce((a, b) => a + ".*" + b);
                const regex = new RegExp(pattern, "i");
                return itemName.match(regex);
            } catch(err) { // if there's a problem with the regex, just return undefined to not filter anything
                return undefined;
            }
        });
    };

    // Updating the filter set by the multi-selector
    const updateTypeFilter = async (e: CustomEvent) => {
        // lock search query
        // $mainFontPickerData.searchLocked = true;

        const fontCategoryFilter = e.detail.values;
        
        // set the real filter
        if(fontCategoryFilter.length > 0){
            roughFilteredFontContent = [...$storedFontData.currentFontContent.filter(fontObj => fontCategoryFilter.includes(fontObj.category))];
        } else {
            roughFilteredFontContent = [...$storedFontData.currentFontContent];
        }
    }

    /**
     * Essentially, this function updates the fine filter (the filter that filters based off of search queries) based on this when rough filter is changed (clicked on filters) AND when the search query lock is off (when users are allowed to search).
     *  From these two conditions, we can deduce that this function will only be called when the user is typing something in, or when the filter is updated while the user is typing in the query.
     * 
     */
    $: if(!!roughFilteredFontContent || !$mainFontPickerData.searchLocked){
        // filter font content based on search query
        if($mainFontPickerData.searchQuery.length > 0){ // this should run when the query is changing
            fontListContainer.scrollTop = 0;
            fineFilteredFontContent = fuzzySearch([...roughFilteredFontContent], $mainFontPickerData.searchQuery);
        } else if (fineFilteredFontContent.length !== roughFilteredFontContent.length) { // this should run when the filter is changing. Not when different shit is being selected
            fineFilteredFontContent = [...roughFilteredFontContent];
            // find new scroll position
            searchFontIndex(fineFilteredFontContent, fontRef.fontObj.family).then(newSelectedFontIndex => {
                // set the scroll position
                if(!!fontListContainer) fontListContainer.scrollTop = newSelectedFontIndex * 35 - 95;
                selectedFontIndex = newSelectedFontIndex;

                // load font previews
                loadNecessaryFontPreview(true, 20, 0);
            });
        }
    }
</script>

<!-- Accessories -->

<section bind:this={mainTitleContainer} id="snapped-title-container" class="hidden" style={
    `transform: translate3d(0px, -${100 + titleHeight}px, 0px)`
}>
    <h6>{name}</h6>
</section>

<!-- Main content (on the top) -->
<main bind:this={mainContainer} style="transform:translate3d(0px, {$contentYOffset}px, 0px)">
    <!-- top main selection container -->
    <section id="top-selector-container">
        <!-- font filter cotainer -->
        <section style="transform: translate3d(0px,-5px,0px)">
            <MultiSelect elements={typeFilters} alignedHorizontally={false} align={"left"} showAlt={true}
            name={""} sub={true} width={130} height={231} radius={6} iconSize={24} iconMargin={12}
            on:valueChange = {updateTypeFilter}
        />
        </section>

        <!-- font selection container -->
        <section id="font-selection-container">
            <!-- Only show fonts if it's not an empty list -->
            {#if fineFilteredFontContent !== undefined && ready}
                <!-- first section for all the main fonts -->
                <section bind:this={fontListContainer} id="font-list-container" on:scroll={() => loadNecessaryFontPreview()}>
                    
                    {#if fineFilteredFontContent.length > 0}
                        <!-- iterate through every font there is -->
                        {#each fineFilteredFontContent as fontObj, i (i)}
                            <div class="text-container {fontRef.fontObj.family === fontObj.family ? "selected" : ""}"
                                on:click={() => updateTypeface(i)}>                            
                                <p class="no-drag" style="font-family: '{fontObj.family}', 'Inter', 'system-ui', 'Tahoma', 'sans-serif'">
                                    {fontObj.appearedName ?? fontObj.family}
                                </p>
                            </div>
                        {/each}
                        <div style="height: 11px"></div>
                    {:else}
                        <p class="no-drag no-result">
                            <span>No results for</span>
                            "{$mainFontPickerData.searchQuery}"
                        </p>
                    {/if}

                </section>

                <!-- section section for all the font variations avaiable -->
                <section id="variation-list-container">
                    {#if !!fineFilteredFontContent[selectedFontIndex] && !!fineFilteredFontContent[selectedFontIndex]["variations"]}
                        <!-- Iterate through every variation for the chosen font -->
                        {#each fineFilteredFontContent[selectedFontIndex].variations as variation}
                            <div class="text-container {fontRef.variation === variation ? "selected" : ""}"
                                on:click={() => updateVariation(variation)}>

                                <p class="no-drag"
                                    style="font-family: '{fineFilteredFontContent[selectedFontIndex].family}', 'Inter', 'system-ui', 'Tahoma', 'sans-serif'; font-weight:{variation}; font-style: {fontsItalisized ? "italic" : ""}; {fontsUnderlined || fontsStriked ? "text-decoration: " : ""} {fontsUnderlined ? "underline" : ""} {fontsStriked ? "line-through" : ""};"
                                >
                                    {beautifiedFontName[getFontNameValue(variation, "name")]}
                                </p>
                            </div>
                        {/each}
                    {/if}
                    <div style="height: 11px"></div>
                </section>
                
            <!-- Show loading spinner if the content hasn't been loaded yet, but it hasn't failed yet -->
            {:else if !$mainFontPickerData.fontLoadFailed}
                <section id="font-load-err-container">
                    <LoadingSpinner />
                </section>
            <!-- Font load failure -->
            {:else}
                <section id="font-load-err-container">
                    <!-- Could not load font for some reason -->
                    <p>Failed to load fonts</p>
                    <button on:click={() => initializeMainFontPickerData(sessionStorageKey)}>
                        Retry
                    </button>
                </section>
            {/if}
        </section>

        <!-- font attribute container -->
        <section id="font-attribute-container" style="transform: translate3d(0px,-5px,0px)">
            <!-- Decoration (underline, italisize, etc...) -->
            <MultiSelect elements={textDecoration} selections={fontRef.textDecorations.map(i => decorationIndices[i])}
            name={""} sub={true} width={140} height={26} radius={6} iconSize={19} iconMargin={0}
            on:valueChange={updateDecoration}/>
            
            <div style="min-height: 2px"></div>

            <!-- Casing -->
            <MultiToggle elements={textCasing} selection={casingIndices[fontRef.casing]}
            name={""} sub={true} width={140} height={26} radius={6} iconSize={19}
            on:valueChange={updateCasing}/>

            <div style="min-height: 2px"></div>
            
            <!-- Alignment -->
            <MultiToggle elements={textAlignment} selection={alignmentIndices[fontRef.alignment]}
            name={""} sub={true} width={140} height={26} radius={6} iconSize={19}
            on:valueChange={updateAlignment}/>

            <div style="min-height: 2px"></div>

            <UnitInput name={"Size"} sub={true} v={fontRef.size.v} u={fontRef.size.u} hasMargin={false} on:updateValue={e => {
                updateTextSizing("size", e)
            }}/>
            
            <div style="min-height: 2px"></div>
            
            <UnitInput name={"Tracking"} minVal={-100} sub={true} v={fontRef.tracking.v} u={fontRef.tracking.u} hasMargin={false} on:updateValue={e => {
                updateTextSizing("tracking", e)
            }}/>
            
            <div style="min-height: 2px"></div>

            <UnitInput name={"Line Height"} minVal={-100} sub={true} v={fontRef.lineHeight.v} u={fontRef.lineHeight.u} hasMargin={false} on:updateValue={e => {
                updateTextSizing("lineHeight", e)
            }}/>
        </section>
    </section>
    <p id="copyright-msg" class="no-drag">
        Web fonts provided by Google Fonts
        &ensp;⎸&ensp;
        <a href="https://developers.google.com/fonts/faq/privacy" target="_blank">Privacy</a>
        </p>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    
    main{
        display: flex; justify-content: center; align-items: center; flex-direction: column;

        #top-selector-container{
            height:232px; width:632px;
            display: flex;

            #font-selection-container{
                width:100%;
                background-color: $primaryl0;
                border-radius: 6px; overflow: hidden;
                display: flex;

                #font-list-container{
                    border-right: 4px solid hsla(0deg, 0%, 0%, 30%);
                    height: 100%; min-width: 200px; max-width: 200px; width: 200px;

                    .no-result{
                        color: $secondarys5;
                        font-size: 14px;
                        width: calc(100% - 20px); height: calc(100% - 20px);
                        padding: 10px; text-align: center;
                        display: flex; justify-content: center; align-items: center; flex-direction: column;

                        span{
                            margin-bottom: 10px;
                        }
                    }
                }
                #variation-list-container{
                    height: 100%; width:100%; margin:0; // fill up the rest of the space
                }

                #font-list-container, #variation-list-container{
                    padding: 5px; margin: 0;
                    overflow-y: scroll;

                    .text-container{
                        width: calc(100% - 20px); height: 35px;
                        padding: 0px 10px 0px 10px; border-radius: 5px;
                        display: flex; align-items: center;
                        cursor: pointer;

                        &:hover{
                            &.selected{
                                background-color: $accentl2;
                            }

                            background-color: $primaryl3;
                            p{ color: white }
                        }

                        &.selected{
                            background-color: $accent;
                            p{ color: white }
                        }

                        p{
                            font-size: 14px;
                            width: 100%; height: fit-content;
                            white-space: nowrap; text-overflow: ellipsis; overflow: hidden;
                            color: $secondarys4;
                        }
                    }
                }

                #font-load-err-container{
                    width:100%; height:100%; margin: 0;
                    display: flex; justify-content: center; align-items: center; flex-direction: column;

                    p{
                        padding-top: 20px;
                        font-size: 14px;
                        color: $secondarys1;
                    }

                    button{
                        margin-top: 10px;
                        background: none;
                        padding: 5px 12px 5px 12px;
                        border: 1.5px solid $secondarys1;
                        border-radius: 6px;
                        color: $secondarys1;
                        font-size:  12px;
                        font-variation-settings: "wght" 600;
                        cursor: pointer;

                        &:hover{
                            background: $secondarys1;
                            color: $primary;
                        }
                    }
                }
            }

            section{
                width: fit-content; height:100%;
                margin-right: 7px;
            }

            #font-attribute-container{
                margin:0;
                display: flex; flex-direction: column;
            }
        }

        #copyright-msg{
            margin-top: 6px;
            font-size: 12px;
            color: $secondarys6;
            font-variation-settings: "wght" 400;
            
            a{
                font-size: 12px;
                color: $secondarys6;
            }
        }
    }

    #snapped-title-container{
        position: absolute; width:100%;
        // we have to use the flex box method because if we don't there's a bug where the text misaligned from time to time
        display:flex; justify-content: center;
        transition: opacity 200ms linear;
        transition-delay: 100ms;
        opacity:1; pointer-events: none;
        
        &.hidden{ opacity:0 }

        h6{
            font-weight: 700;
            user-select: none; -webkit-user-select: none;
        }
    }
</style>