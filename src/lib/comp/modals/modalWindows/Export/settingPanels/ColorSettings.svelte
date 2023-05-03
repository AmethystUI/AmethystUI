<script lang="ts">
    import SettingsPanel from "./SettingsPanel.svelte";
    import { exportConfigs, type fileTypes } from "$lib/util/export/exportManager";
    import MultiToggle, { alignmentType, type multiToggleSelection } from "$src/lib/comp/ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte";
    import Checkbox from "$src/lib/comp/ctrlMenuItems/StyleEditors/Basics/Checkbox.svelte";
    import type { colorFmt } from "$src/lib/types/exportConfigs";

    export let fullPanelWidth = 490;
    export let configSpacing:string = "13px";

    export let multiToggleStyling = {
        "useText" : true,
        "useIcons" : false,
        "contentAlignment" : alignmentType.center,
        "name" : "",
        width : fullPanelWidth,
        height : 32,
        radius : 6,
        textSize: 10,
        textWeight: 500
    }
    export let checkboxStyling = {
        "textSize" : 12,
        "textWeight" : 400,
        "textColor" :  "hsl(0, 0%, 90%)",
        "letterSpacing" : 0.15,
        "checkBoxMargin" : `${configSpacing} 0px 0px 0px`
    }

    let clrFmtSelection: number;
    $: clrFmtSelection = colorFormats.map(e => e.val).indexOf($exportConfigs.stylesheets.colorFmt);
    const updateClrFmt = (e: CustomEvent):void => {
        $exportConfigs.stylesheets.colorFmt = e.detail.value;
    }
    
    $: useUnitInference = $exportConfigs.stylesheets.colorUnitInference;
    const updateUnitInf = (e: CustomEvent):void => {
        $exportConfigs.stylesheets.colorUnitInference = e.detail.v;
    }

    // ====================== UI SHIT ======================
    
    let colorFormats: multiToggleSelection<colorFmt>[];
    $: colorFormats = [
        {
            iconDir : "/src/assets/icons/css.svg",
            val : "hsl",
            alt : `HSL(270°, ${useUnitInference ? "1" : "100%"}, ${useUnitInference ? "0.55" : "55%"})`
        }, {
            iconDir : "/src/assets/icons/scss.svg",
            val : "hex",
            alt : "HEX #8C1AFF"
        }, {
            iconDir : "/src/assets/icons/json.svg",
            val : "rgb",
            alt : "RGB(140, 26, 255)"
        },
    ]

</script>

<SettingsPanel panelName="Colors">
    <!-- Color formatting -->
    <h2 class="configTitle">Formats</h2>
    <MultiToggle {...multiToggleStyling}
        elements={colorFormats} selection={clrFmtSelection} on:valueChange={updateClrFmt} />

    {#if $exportConfigs.stylesheets.colorFmt === "hsl"}
        <Checkbox name="Use Decimals Instead of %" {...checkboxStyling}
            checked={useUnitInference} on:updateValue={updateUnitInf}/>
    {/if}
</SettingsPanel>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    .configTitle{
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0.15px;
        color: $secondarys1;
        margin-bottom: 7px;
    }
</style>