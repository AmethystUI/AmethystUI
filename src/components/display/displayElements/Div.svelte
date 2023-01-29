<script lang="ts">
    import { onMount } from "svelte";

    import { boxShadow, collection, selectedComponent, selectedOverride } from "../../../stores/collection";

    $: currentComponent = $collection[$selectedComponent];
    $: currentOverride = $selectedOverride !== -1 ? $collection[$selectedComponent].styleOverrides[$selectedOverride] : undefined;
    $: es = !!currentComponent || !!currentOverride ? ($selectedOverride === -1 ? currentComponent.style : currentOverride.style) : undefined;

    const generateShadowString = (shadow: boxShadow):string => {
        return `${shadow.base.x.v}${shadow.base.x.u} ` +
                `${shadow.base.y.v}${shadow.base.y.u} ` +
                `${shadow.base.radius.v}${shadow.base.radius.u} ` +
                `${shadow.grow.v}${shadow.grow.u} ` +
                `hsla(${shadow.base.color.h}deg, ${shadow.base.color.s}%, ${shadow.base.color.l}%, ${shadow.base.color.a}%)`;
    }
    let shadowString = "";
    $: if(!!es.boxShadows && es.boxShadows.length > 0) {
        shadowString = generateShadowString(es.boxShadows[0]);
        for(let i = 1; i < es.boxShadows.length; i++){
            shadowString += ", " + generateShadowString(es.boxShadows[i]);
        }
    } else {
        shadowString = "none";
    }
</script>

<main style={`
    transform: translate3d(calc(
        ${!!es.marginLeft ? -es.marginLeft.v/2 : "0"}${!!es.marginLeft ? es.marginLeft.u : "px"}
        + ${!!es.marginRight ? -es.marginRight.v/2 : "0"}${!!es.marginRight ? es.marginRight.u : "px"}
        + ${es.borderWidthLeft && es.USEBORDER ? -es.borderWidthLeft.v/2 : 0}${es.borderWidthLeft ? es.borderWidthLeft.u : "px"}
        + ${es.borderWidthRight && es.USEBORDER ? -es.borderWidthRight.v/2 : 0}${es.borderWidthRight ? es.borderWidthRight.u : "px"}
    ), calc(
        ${!!es.marginTop ? -es.marginTop.v/2 : "0"}${!!es.marginTop ? es.marginTop.u : "px"}
        + ${!!es.marginBottom ? -es.marginBottom.v/2 : "0"}${!!es.marginBottom ? es.marginBottom.u : "px"}
        + ${es.borderWidthTop && es.USEBORDER ? -es.borderWidthTop.v/2 : 0}${es.borderWidthTop ? es.borderWidthTop.u : "px"}
        + ${es.borderWidthBottom && es.USEBORDER ? -es.borderWidthBottom.v/2 : 0}${es.borderWidthBottom ? es.borderWidthBottom.u : "px"}
    ), 0);
`}
class="no-drag">
    <!-- this is fucking nightmare -->

        <div style={`
            ${ //we have do this terribleness if we want to use anything with a united attribute
            ""}
            width:${!!es.width ? es.width.v : "fit-content"}${!!es.width ? es.width.u : ""};
            height:${!!es.height ? es.height.v : "fit-content"}${!!es.height ? es.height.u : ""};

            margin-top:${!!es.marginTop ? es.marginTop.v : 0}${!!es.marginTop ? es.marginTop.u : "px"};
            margin-right:${!!es.marginRight ? es.marginRight.v : 0}${!!es.marginRight ? es.marginRight.u : "px"};
            margin-bottom:${!!es.marginBottom ? es.marginBottom.v : 0}${!!es.marginBottom ? es.marginBottom.u : "px"};
            margin-left:${!!es.marginLeft ? es.marginLeft.v : 0}${!!es.marginLeft ? es.marginLeft.u : "px"};

            padding-top:${!!es.paddingTop ? es.paddingTop.v : 0}${!!es.paddingTop ? es.paddingTop.u : "px"};
            padding-right:${!!es.paddingRight ? es.paddingRight.v : 0}${!!es.paddingRight ? es.paddingRight.u : "px"};
            padding-bottom:${!!es.paddingBottom ? es.paddingBottom.v : 0}${!!es.paddingBottom ? es.paddingBottom.u : "px"};
            padding-left:${!!es.paddingLeft ? es.paddingLeft.v : 0}${!!es.paddingLeft ? es.paddingLeft.u : "px"};

            opacity:${es.opacity/100 ?? 1};
            
            overflow-x:${es.overflowX ?? "auto"};
            overflow-y:${es.overflowY ?? "auto"};

            ${
                // only use border styles if border is enabled
                es["USEBORDER"] ? `
                    border-style: ${es.borderStyleTop ?? "solid"} ${es.borderStyleRight ?? "solid"} ${es.borderStyleBottom ?? "solid"} ${es.borderStyleLeft ?? "solid"};

                    border-top-width:${!!es.borderWidthTop ? es.borderWidthTop.v : 0}${!!es.borderWidthTop ? es.borderWidthTop.u : ""};
                    border-right-width:${!!es.borderWidthRight ? es.borderWidthRight.v : 0}${!!es.borderWidthRight ? es.borderWidthRight.u : ""};
                    border-bottom-width:${!!es.borderWidthBottom ? es.borderWidthBottom.v : 0}${!!es.borderWidthBottom ? es.borderWidthBottom.u : ""};
                    border-left-width:${!!es.borderWidthLeft ? es.borderWidthLeft.v : 0}${!!es.borderWidthLeft ? es.borderWidthLeft.u : ""};

                    border-radius:
                        ${!!es.borderRadiusTop ? es.borderRadiusTop.v : 0}${!!es.borderRadiusTop ? es.borderRadiusTop.u : ""}
                        ${!!es.borderRadiusRight ? es.borderRadiusRight.v : 0}${!!es.borderRadiusRight ? es.borderRadiusRight.u : ""}
                        ${!!es.borderRadiusBottom ? es.borderRadiusBottom.v : 0}${!!es.borderRadiusBottom ? es.borderRadiusBottom.u : ""}
                        ${!!es.borderRadiusLeft ? es.borderRadiusLeft.v : 0}${!!es.borderRadiusLeft ? es.borderRadiusLeft.u : ""};
                    
                    border-color: hsla(${es.borderColor.h ?? 0}deg, ${es.borderColor.s ?? 0}%, ${es.borderColor.l ?? 0}%, ${es.borderColor.a ?? 0}%);
                ` : ""
            }

            ${
                // only use outline styles if outline is enabled
                es["USEOUTLINE"] ? `
                    ${!es["USEBORDER"] ? `
                        border-radius:
                            ${!!es.borderRadiusTop ? es.borderRadiusTop.v : 0}${!!es.borderRadiusTop ? es.borderRadiusTop.u : ""}
                            ${!!es.borderRadiusRight ? es.borderRadiusRight.v : 0}${!!es.borderRadiusRight ? es.borderRadiusRight.u : ""}
                            ${!!es.borderRadiusBottom ? es.borderRadiusBottom.v : 0}${!!es.borderRadiusBottom ? es.borderRadiusBottom.u : ""}
                            ${!!es.borderRadiusLeft ? es.borderRadiusLeft.v : 0}${!!es.borderRadiusLeft ? es.borderRadiusLeft.u : ""};
                    ` : ""}

                    outline-style: ${es.outlineStyle ?? "solid"};
                    outline-width:${!!es.outlineWidth ? es.outlineWidth.v : 0}${!!es.outlineWidth ? es.outlineWidth.u : ""};
                    outline-offset:${!!es.outlineOffset ? es.outlineOffset.v : 0}${!!es.outlineOffset ? es.outlineOffset.u : ""};
                    outline-color: hsla(${es.outlineColor.h ?? 0}deg, ${es.outlineColor.s ?? 0}%, ${es.outlineColor.l ?? 0}%, ${es.outlineColor.a ?? 0}%);
                ` : ""
            }

            ${
                // only use background styles if background is enabled
                es["USEBACKGROUND"] ? `
                    background-color: hsla(${es.backgroundColor.h ?? 0}deg, ${es.backgroundColor.s ?? 0}%, ${es.backgroundColor.l ?? 0}%, ${es.backgroundColor.a ?? 0}%);
                ` : ""
            }

            ${
                // only use shadow styles if background is enabled
                es["USESHADOW"] ? `
                    box-shadow: ${shadowString};
                ` : ""
            }

            transform: translate3d(
            calc(
                ${!!es.marginLeft ? -es.marginLeft.v/2 : "0"}${!!es.marginLeft ? es.marginLeft.u : "px"}
                - ${!!es.marginRight ? -es.marginRight.v/2 : "0"}${!!es.marginRight ? es.marginRight.u : "px"}
                + ${es.borderWidthLeft ? -es.borderWidthLeft.v/2 : 0}${es.borderWidthLeft ? es.borderWidthLeft.u : "px"}
                - ${es.borderWidthRight ? -es.borderWidthRight.v/2 : 0}${es.borderWidthRight ? es.borderWidthRight.u : "px"}),
            calc(
                ${!!es.marginTop ? -es.marginTop.v/2 : "0"}${!!es.marginTop ? es.marginTop.u : "px"}
                - ${!!es.marginBottom ? -es.marginBottom.v/2 : "0"}${!!es.marginBottom ? es.marginBottom.u : "px"}
                + ${es.borderWidthTop ? -es.borderWidthTop.v/2 : 0}${es.borderWidthTop ? es.borderWidthTop.u : "px"}
                - ${es.borderWidthBottom ? -es.borderWidthBottom.v/2 : 0}${es.borderWidthBottom ? es.borderWidthBottom.u : "px"}),
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