<script lang="ts">
    export let name:string;
    export let sub = false;
    export let align = "left";
    export let textClrOverride = "";
    export let hasMargin = true;
    export let yOffset = 0;
    export let width = "100%";
</script>

<main style="transform: translate(0px, {yOffset}px);">
    <h1 class={`${sub ? "sub" : ""}`} style={`
        text-align: ${align}
        ${!!textClrOverride ? `;
        color:${textClrOverride}` : ""};
        ${!hasMargin ? "margin: 0" : ""};
        width: ${width};
    `}>{name}</h1>
</main>

<style lang="scss">
    @import "../../../../../public/guideline";

    main{
        h1{
            font-size: 14px;
            width: inherit;
            color: $secondarys4;
            font-variation-settings: "wght" 400;
            user-select: none; -webkit-user-select: none; pointer-events: none;
            margin: 3px 0 7px 0;

            &.sub{
                font-size: 10px;
                color: $secondarys5;
                font-weight: 300;
                margin: 4px 0 5px 0;
            }
        }
    }
</style>