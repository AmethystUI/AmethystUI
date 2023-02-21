<script lang="ts">
    import { onMount } from "svelte";

    import { boxShadow, collection, selectedComponent, selectedOverride } from "../../../stores/collection";

    $: currentComponent = $collection[$selectedComponent];
    $: currentOverride = $selectedOverride !== -1 ? $collection[$selectedComponent].styleOverrides[$selectedOverride] : undefined;
    $: currentStyle = !!currentComponent || !!currentOverride ? ($selectedOverride === -1 ? currentComponent.style : currentOverride.style) : undefined;

    const generateShadowString = (shadow: boxShadow):string => {
        return `${shadow.base.x.v}${shadow.base.x.u} ` +
                `${shadow.base.y.v}${shadow.base.y.u} ` +
                `${shadow.base.radius.v}${shadow.base.radius.u} ` +
                `${shadow.grow.v}${shadow.grow.u} ` +
                `hsla(${shadow.base.color.h}deg, ${shadow.base.color.s}%, ${shadow.base.color.l}%, ${shadow.base.color.a}%)`;
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

    // ======================= UPDATE FUNCTION ======================= //

</script>

<!-- Container transformation to keep the element in the center -->
<main style={`
    transform: translate3d(calc(
        ${!!currentStyle.marginLeft ? -currentStyle.marginLeft.v/2 : "0"}${!!currentStyle.marginLeft ? currentStyle.marginLeft.u : "px"}
        + ${!!currentStyle.marginRight ? -currentStyle.marginRight.v/2 : "0"}${!!currentStyle.marginRight ? currentStyle.marginRight.u : "px"}
        + ${currentStyle.borderWidthLeft && currentStyle.USEBORDER ? -currentStyle.borderWidthLeft.v/2 : 0}${currentStyle.borderWidthLeft ? currentStyle.borderWidthLeft.u : "px"}
        + ${currentStyle.borderWidthRight && currentStyle.USEBORDER ? -currentStyle.borderWidthRight.v/2 : 0}${currentStyle.borderWidthRight ? currentStyle.borderWidthRight.u : "px"}
    ), calc(
        ${!!currentStyle.marginTop ? -currentStyle.marginTop.v/2 : "0"}${!!currentStyle.marginTop ? currentStyle.marginTop.u : "px"}
        + ${!!currentStyle.marginBottom ? -currentStyle.marginBottom.v/2 : "0"}${!!currentStyle.marginBottom ? currentStyle.marginBottom.u : "px"}
        + ${currentStyle.borderWidthTop && currentStyle.USEBORDER ? -currentStyle.borderWidthTop.v/2 : 0}${currentStyle.borderWidthTop ? currentStyle.borderWidthTop.u : "px"}
        + ${currentStyle.borderWidthBottom && currentStyle.USEBORDER ? -currentStyle.borderWidthBottom.v/2 : 0}${currentStyle.borderWidthBottom ? currentStyle.borderWidthBottom.u : "px"}
    ), 0);
`}
class="no-drag">
    <!-- We have do this terribleness if we want to use anything with a united attribute. It's also fast -->
    <!-- If you want a quick guide, "currentStyle.width?" checks if width exist on the current style. If it's undefined, it will default to whatever is after the "??" -->
    <div style={`
        width: ${ currentStyle.width?.v ?? "auto" }${ currentStyle.width?.u ?? "" };
        height: ${ currentStyle.height?.v ?? "auto" }${ currentStyle.height?.u ?? "" };

        margin-top: ${ currentStyle.marginTop?.v ?? "auto" }${ currentStyle.marginTop?.u ?? "" };
        margin-right: ${ currentStyle.marginRight?.v ?? "auto" }${ currentStyle.marginRight?.u ?? "" };
        margin-bottom: ${ currentStyle.marginBottom?.v ?? "auto" }${ currentStyle.marginBottom?.u ?? "" };
        margin-left: ${ currentStyle.marginLeft?.v ?? "auto" }${ currentStyle.marginLeft?.u ?? "" };

        padding-top: ${ currentStyle.paddingTop?.v ?? "auto" }${ currentStyle.paddingTop?.u ?? "" };
        padding-right: ${ currentStyle.paddingRight?.v ?? "auto" }${ currentStyle.paddingRight?.u ?? "" };
        padding-bottom: ${ currentStyle.paddingBottom?.v ?? "auto" }${ currentStyle.paddingBottom?.u ?? "" };
        padding-left: ${ currentStyle.paddingLeft?.v ?? "auto" }${ currentStyle.paddingLeft?.u ?? "" };

        opacity:${currentStyle.opacity/100 ?? 1};
        
        overflow-x:${currentStyle.overflowX ?? "auto"};
        overflow-y:${currentStyle.overflowY ?? "auto"};

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

        ${ // only use background styles if background is enabled
            currentStyle["USEBACKGROUND"] ? `
                background-color: hsla(${currentStyle.backgroundColor.h ?? 0}deg, ${currentStyle.backgroundColor.s ?? 0}%, ${currentStyle.backgroundColor.l ?? 0}%, ${currentStyle.backgroundColor.a ?? 0}%);
            ` : ""
        }

        ${ // only use shadow styles if background is enabled
            currentStyle["USESHADOW"] ? `
                box-shadow: ${shadowString};
            ` : ""
        }

        transform: translate3d(
        calc(
            ${ -currentStyle.marginLeft?.v/2 ?? 0 }${ currentStyle.marginLeft?.u ?? "px" }
            - ${ -currentStyle.marginRight?.v/2 ?? 0 }${ currentStyle.marginRight?.u ?? "px" }
            + ${ -currentStyle.borderWidthLeft?.v/2 ?? 0}${ currentStyle.borderWidthLeft?.u ?? "px"}
            - ${ -currentStyle.borderWidthRight?.v/2 ?? 0}${ currentStyle.borderWidthRight?.u ?? "px"}),
        calc(
            ${ -currentStyle.marginTop?.v/2 ?? 0 }${ currentStyle.marginTop?.u ?? "px"}
            - ${ -currentStyle.marginBottom?.v/2 ?? 0 }${ currentStyle.marginBottom?.u ?? "px"}
            + ${ -currentStyle.borderWidthTop?.v/2 ?? 0 }${ currentStyle.borderWidthTop?.u ?? "px"}
            - ${ -currentStyle.borderWidthBottom?.v/2 ?? 0 }${ currentStyle.borderWidthBottom?.u ?? "px"}),
        0);
    `}></div>
</main>

<style lang="scss">
    @import "../../../../public/guideline";

    main{
        position: absolute; top:0px; left:0px;
        display: flex; justify-content: center; align-items: center; flex-direction: column;        
    }
</style>