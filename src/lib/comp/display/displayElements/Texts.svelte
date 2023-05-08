<script lang="ts">
    import { onMount } from "svelte";
    import { collection, selectedComponent, selectedOverride } from "$lib/stores/collection";
    import TextContent from "$lib/comp/display/displayElements/util/TextContent.svelte";

    export let headingType: string;

    $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    onMount(() => { $collection = $collection }); // required to refresh the current style so all the initialized values can load.

    // specific style shortcuts
    $: textItalisized = !!currentStyle ? currentStyle?.typeStyle?.textDecorations?.includes("italicize") ?? false : false;
    $: textUnderlined = !!currentStyle ? currentStyle?.typeStyle?.textDecorations?.includes("underline") ?? false : false;
    $: textStriked = !!currentStyle ? currentStyle?.typeStyle?.textDecorations?.includes("strike") ?? false : false;

    $: dynamicStyle = `
        width: ${ !currentStyle.width?.v ? "0" : currentStyle.width?.u === "fit-content" ? "" : currentStyle.width?.v }${ currentStyle.width?.u ?? "px" };
        height: ${ !currentStyle.height?.v ? "0" : currentStyle.height?.u === "fit-content" ? "" : currentStyle.height?.v }${ currentStyle.height?.u ?? "px" };

        padding-top: ${ currentStyle.paddingTop?.v ?? "auto" }${ currentStyle.paddingTop?.u ?? "" };
        padding-right: ${ currentStyle.paddingRight?.v ?? "auto" }${ currentStyle.paddingRight?.u ?? "" };
        padding-bottom: ${ currentStyle.paddingBottom?.v ?? "auto" }${ currentStyle.paddingBottom?.u ?? "" };
        padding-left: ${ currentStyle.paddingLeft?.v ?? "auto" }${ currentStyle.paddingLeft?.u ?? "" };

        opacity:${currentStyle.opacity/100 ?? 1};
        
        overflow-x:${currentStyle.overflowX ?? "auto"};
        overflow-y:${currentStyle.overflowY ?? "auto"};

        ${ // decide whether or not to use the flexbox container by seeing if any flex attribtues are set
            currentStyle.justifyContent !== "none" || currentStyle.alignItems !== "none" ?`
                display: flex;
                ${ // check if justify content is set. If so, use it
                    currentStyle.justifyContent !== "none" ? `justify-content: ${currentStyle.justifyContent ?? "flex-start"};` : ""
                }
                ${ // check if align items is set. If so, use it
                    currentStyle.alignItems!== "none"? `align-items: ${currentStyle.alignItems?? "flex-start"};` : ""
                }
            `: ""
        }

        ${ // only use border styles if border is enabled
            currentStyle["USEBORDER"] ? `
                border-style: ${currentStyle.borderStyleTop ?? "solid"} ${currentStyle.borderStyleRight ?? "solid"} ${currentStyle.borderStyleBottom ?? "solid"} ${currentStyle.borderStyleLeft ?? "solid"};

                border-width:
                    ${ currentStyle.borderWidthTop?.v ?? 0 }${ currentStyle.borderWidthTop?.u ?? ""}
                    ${ currentStyle.borderWidthRight?.v ?? 0 }${ currentStyle.borderWidthRight?.u ?? ""}
                    ${ currentStyle.borderWidthBottom?.v ?? 0 }${ currentStyle.borderWidthBottom?.u ?? ""}
                    ${ currentStyle.borderWidthLeft?.v ?? 0 }${ currentStyle.borderWidthLeft?.u ?? ""};

                border-radius:
                    ${ currentStyle.borderRadiusTop?.v ?? 0 }${ currentStyle.borderRadiusTop?.u ?? ""}
                    ${ currentStyle.borderRadiusRight?.v ?? 0 }${ currentStyle.borderRadiusRight?.u ?? ""}
                    ${ currentStyle.borderRadiusBottom?.v ?? 0 }${ currentStyle.borderRadiusBottom?.u ?? ""}
                    ${ currentStyle.borderRadiusLeft?.v ?? 0 }${ currentStyle.borderRadiusLeft?.u ?? ""};
                
                border-color: hsla(${currentStyle.borderColor.h ?? 0}deg, ${currentStyle.borderColor.s ?? 0}%, ${currentStyle.borderColor.l ?? 0}%, ${currentStyle.borderColor.a ?? 0}%);
            ` : ""
        }

        ${ // only use background styles if background is enabled
            currentStyle["USEBACKGROUND"] ? `
                background-color: hsla(${currentStyle.backgroundColor.h ?? 0}deg, ${currentStyle.backgroundColor.s ?? 0}%, ${currentStyle.backgroundColor.l ?? 0}%, ${currentStyle.backgroundColor.a ?? 0}%);
            ` : ""
        }

        ${ // only use shadow styles if background is enabled
            currentStyle["USESHADOW"] ? `
                text-shadow: ${shadowString};
            ` : ""
        }

        ${ // only use text styles if text is enabled
            currentStyle["USETEXT"]? `
                color: hsla(${currentStyle.color?.h ?? 0}deg, ${currentStyle.color?.s ?? 0}%, ${currentStyle.color?.l ?? 0}%, ${currentStyle.color?.a ?? 0}%);
                
                font-size: ${ currentStyle.typeStyle?.size?.v ?? 14 }${ currentStyle.typeStyle?.size?.u ?? "px" };
                font-family: "${ currentStyle.typeStyle?.fontObj?.family ?? "Inter" }", Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                font-weight: ${ currentStyle.typeStyle?.variation ?? "" };

                text-align: ${ currentStyle.typeStyle?.alignment ?? "left" };
                letter-spacing: ${ currentStyle.typeStyle?.tracking?.v ?? "100%" }${ currentStyle.typeStyle?.tracking?.u ?? "" };
                line-height: ${ currentStyle.typeStyle?.lineHeight?.v?? "100%" }${ currentStyle.typeStyle?.lineHeight?.u?? "" };
                text-transform: ${ currentStyle.typeStyle?.casing ?? "none" };
                ${textUnderlined || textStriked ? // if the text is either underlined or striked
                    `text-decoration: ${ textUnderlined ? "underline" : "" } ${ textStriked ? "line-through" : "" };
                    `: ""
                }
                font-style: ${textItalisized ? "italic" : "none"};
            ` : ""
        }
    `

    const generateShadowString = (shadow: boxShadow):string => {
        return `${shadow.x.v}${shadow.x.u} ` +
                `${shadow.y.v}${shadow.y.u} ` +
                `${shadow.radius.v}${shadow.radius.u} ` +
                `hsla(${shadow.color.h}deg, ${shadow.color.s}%, ${shadow.color.l}%, ${shadow.color.a}%)`;
    }
    let shadowString = "";
    $: if(!!currentStyle.boxShadows && currentStyle.boxShadows.length > 0) {
        shadowString = generateShadowString(currentStyle.boxShadows[0]);
        for(let i = 1; i < currentStyle.boxShadows.length; i++){
            shadowString += ", " + generateShadowString(currentStyle.boxShadows[i]);
        }
    } else {
        shadowString = "none";
    }
</script>

<!-- Container transformation to keep the element in the center -->
<main class="no-drag">
    {#if headingType === "h1"}
        <h1 style={dynamicStyle} class="no-drag"> <TextContent currentStyle={currentStyle}/> </h1>
    {:else if headingType === "h2"}
        <h2 style={dynamicStyle} class="no-drag"> <TextContent currentStyle={currentStyle}/> </h2>
    {:else if headingType === "h3"}
        <h3 style={dynamicStyle} class="no-drag"> <TextContent currentStyle={currentStyle}/> </h3>
    {:else if headingType === "h4"}
        <h4 style={dynamicStyle} class="no-drag"> <TextContent currentStyle={currentStyle}/> </h4>
    {:else if headingType === "h5"}
        <h5 style={dynamicStyle} class="no-drag"> <TextContent currentStyle={currentStyle}/> </h5>
    {:else if headingType === "h6"}
        <h6 style={dynamicStyle} class="no-drag"> <TextContent currentStyle={currentStyle}/> </h6>
    {:else if headingType === "p"}
        <p style={dynamicStyle} class="no-drag"> <TextContent currentStyle={currentStyle}/> </p>
    {/if}
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    main{
        display: flex; justify-content: center; align-items: center; flex-direction: column;
        overflow: visible;
    }
</style>