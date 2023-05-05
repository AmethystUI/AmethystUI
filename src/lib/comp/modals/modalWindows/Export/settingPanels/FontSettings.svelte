<script lang="ts">
    import SettingsPanel from "./SettingsPanel.svelte";
    import { exportConfigs } from "$lib/util/export/exportManager";
    import Checkbox from "$src/lib/comp/ctrlMenuItems/StyleEditors/Basics/Checkbox.svelte";
    import InfoTag from "$src/lib/comp/ctrlMenuItems/StyleEditors/Basics/InfoTag.svelte";

    export let fullPanelWidth;
    export let configSpacing:string;

    export let multiToggleStyling;
    export let checkboxStyling;

    $: integrateFonts = $exportConfigs.stylesheets.fontIntegration;
    const updateIntegration = (e: CustomEvent):void => {
        $exportConfigs.stylesheets.fontIntegration = e.detail.v;
    }
    
    $: loadFullTypeface = $exportConfigs.stylesheets.loadFullTypeface;
    const updateMinimization = (e: CustomEvent):void => {
        $exportConfigs.stylesheets.loadFullTypeface = e.detail.v;
    }

    $: localizeFonts = $exportConfigs.stylesheets.fontLocalization;
    const updateLocalization = (e: CustomEvent):void => {
        $exportConfigs.stylesheets.fontLocalization = e.detail.v;
    }
</script>

<SettingsPanel panelName="Typography">
    <Checkbox name="Integrate Fonts into Stylesheet" {...checkboxStyling}
        checked={integrateFonts} on:updateValue={updateIntegration}/>

    {#if integrateFonts}
        <Checkbox name="Load Full Typeface" {...checkboxStyling}
        checked={loadFullTypeface} on:updateValue={updateMinimization}/>
    
        <section>
            <Checkbox name="Localize Fonts with Base64" {...checkboxStyling}
                checked={localizeFonts} on:updateValue={updateLocalization}/>
            <InfoTag info="Base64 localization will allow fonts to be loaded even when offline. But it will also significantly increase the file size, and may impact page load performance." margin="0px 0px 0px 7px"/>
        </section>
    {/if}
</SettingsPanel>

<style lang="scss">
    section{
        display: flex; align-items: flex-end;
    }
</style>