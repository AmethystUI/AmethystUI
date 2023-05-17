<script lang="ts">
    import SettingsPanel from "./SettingsPanel.svelte";
    import { exportConfigs } from "$lib/util/export/exportManager";
    import Checkbox from "$src/lib/comp/ctrlMenuItems/StyleEditors/Basics/Checkbox.svelte";

    export let checkboxStyling;

    let nestStyles: boolean;
    $: nestStyles = $exportConfigs.scss.nestStyles;
    const updateNesting = (e: CustomEvent):void => {
        $exportConfigs.scss.nestStyles = e.detail.v;
    }
</script>

<SettingsPanel panelName="SCSS">
    <Checkbox name="Nest Styles" {...checkboxStyling}
        checked={nestStyles} on:updateValue={updateNesting}/>
</SettingsPanel>

<style lang="scss">
</style>