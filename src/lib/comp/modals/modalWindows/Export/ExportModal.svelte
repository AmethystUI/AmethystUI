<script lang="ts" context="module">
    import { closeModal } from "$src/lib/comp/modals/modalManager";
    import { alignmentType, type multiToggleSelection } from "$lib/comp/ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte";

    const configFilters:multiToggleSelection<exportableFileTypes>[] = [
        {
            iconDir : "$assets/icons/css.svg",
            val : "css",
            alt : "CSS"
        },
        // TODO: enable in future versions
        // {
        //     iconDir : "$assets/icons/scss.svg",
        //     val : "scss",
        //     alt : "SCSS"
        // },
        {
            iconDir : "$assets/icons/json.svg",
            val : "json",
            alt : "JSON"
        },
    ]

    const fullPanelWidth = 540;
    const configSpacing = "13px";
    const configPanelStyling = {
        fullPanelWidth,
        configSpacing,
        multiToggleStyling : {
            "useText" : true,
            "useIcons" : false,
            "contentAlignment" : alignmentType.center,
            "name" : "",
            width : fullPanelWidth,
            height : 32,
            radius : 6,
            textSize: 10,
            textWeight: 500
        },
        checkboxStyling : {
            "textSize" : 12,
            "textWeight" : 400,
            "textColor" :  "hsl(0, 0%, 90%)",
            "letterSpacing" : 0.15,
            "checkBoxMargin" : `${configSpacing} 0px 0px 0px`
        }
    }

</script>

<script lang="ts">
    import MultiToggle from "$lib/comp/ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte";
    import { nonStylesheetTypes, targetFileType } from "$src/lib/util/export/exportManager";
    import ColorSettings from "./settingPanels/ColorSettings.svelte";
    import FontSettings from "./settingPanels/FontSettings.svelte";
    import CompressionSettings from "./settingPanels/CompressionSettings.svelte";
    import ScssSpecificSettings from "./settingPanels/ScssSpecificSettings.svelte";
    import { startExport } from "$lib/util/export/exportManager";
    import { fileSettings, saveName } from "$src/lib/stores/fileStatus";

    $: currentFilterIndex = configFilters.map(item => item.val).indexOf($targetFileType);

    const updateConfigFilter = (e: CustomEvent) => $targetFileType = e.detail.value;

    let saveNameInput: HTMLInputElement;

    const sanitizeFilename = (input: string): string => {
        // Remove forbidden characters
        const forbiddenChars = /[<>:"\/\\|?*\x00-\x1F]/g;
        let sanitized = input.replace(forbiddenChars, '');

        // Remove reserved filenames for Windows
        const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
        if (reservedNames.test(sanitized)) {
            sanitized = "file_" + sanitized;
        }

        // Windows filenames cannot end with a space or dot
        sanitized = sanitized.replace(/[. ]+$/, '');

        return sanitized;
    }
    const updateSaveName = (e: KeyboardEvent) => {
        if(e.key === "Enter"){
            // save the new input save as the save name
            const newName = sanitizeFilename(saveNameInput.value);
            if(newName.length > 0) $saveName = newName;
        }
        
        if(e.key === "Enter" || e.key === "Escape"){
            saveNameInput.blur();
            // update value field
            saveNameInput.value = $saveName;
        }
    };
</script>

<main>
    <h2 class="no-drag">Export As...</h2>
    
    <!-- Settings content -->
    <section id="setting-container">
        <!-- Setting filter -->
        <section id="setting-filters-container">
            <MultiToggle elements={configFilters} selection={currentFilterIndex} useText={true}
            contentAlignment={alignmentType.center} horizontallyAligned={false} useHoverEffect={false}
            name={""} sub={true} width={70} height={configFilters.length * 50} radius={6} iconSize={16} textSize={10} textWeight={400}
            on:valueChange={updateConfigFilter}/>
        </section>
        <div id="separator"></div>
        
        <section id="setting-panels-container">
            <!-- Common Stylesheet Configs -->
            {#if !nonStylesheetTypes.includes($targetFileType)}
                <ColorSettings {...configPanelStyling}/>
                <FontSettings {...configPanelStyling}/>
            {/if}

            <!-- SCSS only configs -->
            {#if $targetFileType === "scss"}
                <ScssSpecificSettings {...configPanelStyling}/>
            {/if}

            <!-- Common settings -->
            <CompressionSettings {...configPanelStyling}/>
        </section>
    </section>

    <!-- file name & export -->
    <section id="export-container">
        <input bind:this={saveNameInput} on:keypress={updateSaveName} type="text" value="{$saveName}" placeholder="{$fileSettings.name}"/>
        
        <!-- cancel export -->
        <button class="secondary-btn" style="margin: 0px 10px 0px 10px" on:click={closeModal}>Cancel</button>
        <!-- export -->
        <button on:click={startExport}>Export</button>
    </section>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    
    main{
        width: 650px; height: fit-content;

        #setting-container{
            $setting-filter-width: 80px;
            $separator-width: 10px;

            width: 100%; height: 250px;
            display: flex;
            background-color: $primaryl1;
            border-radius: 6px;
            margin-bottom: 10px;
            overflow: hidden;

            #setting-filters-container{
                padding: 5px;
                height: calc(100% - 10px); width: calc($setting-filter-width - 10px);
                background-color: $primary;
                border-radius: 6px;
            }
            #separator{
                height: 100%; width: $separator-width;
            }
            #setting-panels-container{
                width: calc(100% - $setting-filter-width - $separator-width); height: 100%;
                background-color: $primary;
                border-radius: 6px;
                overflow-y: scroll; overflow-x: hidden;
            }
        }

        #export-container{
            width: 100%; height: 30px;
            background: none;
            display: flex;

            button{
                height: 100%;
                width: 90px; min-width: 90px;
                border: none; border-radius: 6px;
                background-color: $accent;
                color: white;
                font-weight: 600; font-size: 12px;
                cursor: pointer;

                &.secondary-btn{
                    background-color: $primaryl3;
                    font-weight: 400;

                    &:hover{
                        background-color: $primaryl5;
                    } &:active{
                        background-color: $primaryl3;
                    }
                }

                &:hover{
                    background-color: $accentl1;
                } &:active{
                    background-color: $accent;
                }
            }

            input{
                $input-padding: 10px;

                width: 100%; height: 100%;
                border:none; border-radius: 6px;
                background-color: $primary;
                padding: 0px $input-padding 0px $input-padding;
                color: $secondary;
                font-size: 12px;
                outline: none;
            }
        }
    
        h2{
            font-size: 18px;
            font-weight: 600;
            height: 30px; width: 100%;
            display:flex; justify-content: center; align-items: center;
            margin: 0px 0px 10px 0px; padding: 0;
        }
    }
</style>