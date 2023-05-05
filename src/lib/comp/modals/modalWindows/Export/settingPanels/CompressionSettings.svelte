<script lang="ts" context="module">
    import type { multiToggleSelection } from "$src/lib/comp/ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte";

    const compressionAmts: multiToggleSelection<number>[] = [
        {
            iconDir : "",
            val : 0,
            alt : "Readable"
        }, {
            iconDir : "",
            val : 1,
            alt : "Concise"
        }, {
            iconDir : "",
            val : 2,
            alt : "Minimized"
        },
    ]
</script>

<script lang="ts">
    import SettingsPanel from "./SettingsPanel.svelte";
    import { exportConfigs } from "$lib/util/export/exportManager";
    import MultiToggle from "$src/lib/comp/ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte";

    export let fullPanelWidth;
    export let configSpacing:string;

    export let multiToggleStyling;
    export let checkboxStyling;

    let compressionSelection: number;
    $: compressionSelection = $exportConfigs.common.compressionAmt;
    const updateCompression = (e: CustomEvent):void => {
        $exportConfigs.common.compressionAmt = e.detail.value;
    }
</script>

<SettingsPanel panelName="Post Processing">
    <h2 class="configTitle">Output File Should Be</h2>
    <MultiToggle {...multiToggleStyling}
        elements={compressionAmts} selection={compressionSelection} on:valueChange={updateCompression} />
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