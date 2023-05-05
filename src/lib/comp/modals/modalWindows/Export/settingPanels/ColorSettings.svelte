<script lang="ts">
    import SettingsPanel from "./SettingsPanel.svelte";
    import { exportConfigs } from "$lib/util/export/exportManager";
    import MultiToggle, { alignmentType, type multiToggleSelection } from "$src/lib/comp/ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte";
    import Checkbox from "$src/lib/comp/ctrlMenuItems/StyleEditors/Basics/Checkbox.svelte";
    import type { colorFmt } from "$src/lib/types/exportConfigs";

    export let fullPanelWidth;
    export let configSpacing:string;

    export let multiToggleStyling;
    export let checkboxStyling;

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
            iconDir : "",
            val : "hsl",
            alt : `HSL(270°, ${useUnitInference ? "1" : "100%"}, ${useUnitInference ? "0.55" : "55%"})`
        }, {
            iconDir : "",
            val : "hex",
            alt : "HEX #8C1AFF"
        }, {
            iconDir : "",
            val : "rgb",
            alt : "RGB(140, 26, 255)"
        },
    ]

</script>

<SettingsPanel panelName="Colors">
    <!-- Color formatting -->
    <h2 class="configTitle">Preferred Format</h2>
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