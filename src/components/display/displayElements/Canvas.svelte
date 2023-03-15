<script lang="ts">
    import { onMount } from "svelte";
    import { collection, selectedComponent, selectedOverride } from "../../../stores/collection";
    import type { boxShadow } from "../../../types/general";

    $: currentStyle = $selectedOverride === -1 ? $collection[$selectedComponent]?.style : $collection[$selectedComponent]?.styleOverrides[$selectedOverride]?.style;

    onMount(() => { $collection = $collection }); // required to refresh the current style so all the initialized values can load.
    
    // specific style shortcuts
    $: textItalisized = !!currentStyle ? currentStyle?.typeStyle?.textDecorations?.includes("italicize") ?? false : false;
    $: textUnderlined = !!currentStyle ? currentStyle?.typeStyle?.textDecorations?.includes("underline") ?? false : false;
    $: textStriked = !!currentStyle ? currentStyle?.typeStyle?.textDecorations?.includes("strike") ?? false : false;

    const generateShadowString = (shadow: boxShadow):string => {
        return `${shadow.x.v}${shadow.x.u} ` +
                `${shadow.y.v}${shadow.y.u} ` +
                `${shadow.radius.v}${shadow.radius.u} ` +
                `${shadow.grow.v}${shadow.grow.u} ` +
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
    <!-- We have do this terribleness if we want to use anything with a united attribute. It's also fast -->
    <!-- If you want a quick guide, "currentStyle.width?" checks if width exist on the current style. If it's undefined, it will default to whatever is after the "??" -->
    <canvas style={`
        width: ${ currentStyle.width?.v ?? "0" }${ currentStyle.width?.u ?? "px" };
        height: ${ currentStyle.height?.v ?? "0" }${ currentStyle.height?.u ?? "px" };

        padding-top: ${ currentStyle.paddingTop?.v ?? "auto" }${ currentStyle.paddingTop?.u ?? "" };
        padding-right: ${ currentStyle.paddingRight?.v ?? "auto" }${ currentStyle.paddingRight?.u ?? "" };
        padding-bottom: ${ currentStyle.paddingBottom?.v ?? "auto" }${ currentStyle.paddingBottom?.u ?? "" };
        padding-left: ${ currentStyle.paddingLeft?.v ?? "auto" }${ currentStyle.paddingLeft?.u ?? "" };

        opacity:${currentStyle.opacity/100 ?? 1};

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

        ${ // only use outline styles if outline is enabled
            currentStyle["USEOUTLINE"] ? `
                ${!currentStyle["USEBORDER"] ? `
                    border-radius:
                        ${ currentStyle.borderRadiusTop?.v ?? 0 }${ currentStyle.borderRadiusTop?.u ?? ""}
                        ${ currentStyle.borderRadiusRight?.v ?? 0 }${ currentStyle.borderRadiusRight?.u ?? ""}
                        ${ currentStyle.borderRadiusBottom?.v ?? 0 }${ currentStyle.borderRadiusBottom?.u ?? ""}
                        ${ currentStyle.borderRadiusLeft?.v ?? 0 }${ currentStyle.borderRadiusLeft?.u ?? ""};
                ` : ""}

                outline-style: ${ currentStyle.outlineStyle ?? "solid" };
                outline-width: ${ currentStyle.outlineWidth?.v ?? 0 }${ currentStyle.outlineWidth?.u ?? "" };
                outline-offset:${ currentStyle.outlineOffset?.v ?? 0 }${ currentStyle.outlineOffset?.u ?? ""};
                
                outline-color: hsla(${currentStyle.outlineColor.h ?? 0}deg, ${currentStyle.outlineColor.s ?? 0}%, ${currentStyle.outlineColor.l ?? 0}%, ${currentStyle.outlineColor.a ?? 0}%);
            ` : ""
        }

        ${ // only use shadow styles if background is enabled
            currentStyle["USESHADOW"] ? `
                box-shadow: ${shadowString};
            ` : ""
        }
    `}
    class="no-drag">
    </canvas>
</main>

<style lang="scss">
    @import "../../../../public/guideline";

    main{
        display: flex; justify-content: center; align-items: center; flex-direction: column;
        overflow: visible;
    }
</style>