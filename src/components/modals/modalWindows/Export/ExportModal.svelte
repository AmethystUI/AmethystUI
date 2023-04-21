<script lang="ts" context="module">
    import { closeModal } from "../../../../stores/modalManager";
    import type { fileTypes } from "../../../../util/exportEngine/exportManager";
    import { alignmentType, multiToggleSelection } from "../../../ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte";

    const verticalAlignments: multiToggleSelection<fileTypes>[] = [
        {
            iconDir : "",
            val : "css",
            alt : ".CSS"
        },{
            iconDir : "",
            val : "scss",
            alt : ".SCSS"
        }, {
            iconDir : "",
            val : "json",
            alt : ".JSON"
        },
    ]

    const test:multiToggleSelection<any>[] = [
        {
            iconDir : "./assets/icons/css.svg",
            val : "flex-start",
            alt : "CSS"
        }, {
            iconDir : "./assets/icons/scss.svg",
            val : "center",
            alt : "SCSS"
        }, {
            iconDir : "./assets/icons/json.svg",
            val : "flex-end",
            alt : "JSON"
        },
    ]
</script>

<script lang="ts">
    import MultiToggle from "../../../ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte";
    import SettingsPanel from "./settingPanels/SettingsPanel.svelte";
</script>

<main>
    <h2 class="no-drag">Export As...</h2>
    
    <!-- Settings content -->
    <section id="setting-container">
        <!-- Setting filter -->
        <section id="setting-filters-container">
            <MultiToggle elements={test} selection={0} useText={true}
            contentAlignment={alignmentType.center} horizontallyAligned={false} useHoverEffect={false}
            name={""} sub={true} width={70} height={test.length * 50} radius={6} iconSize={16} textSize={10} textWeight={400}/>
        </section>
        <div id="separator"></div>
        
        <section id="setting-panels-container">
            <SettingsPanel>
                
            </SettingsPanel>
        </section>
    </section>

    <!-- file name & export -->
    <section id="export-container">
        <input type="text" value="Untitled" placeholder="Untitled"/>
        
        <!-- cancel export -->
        <button class="secondary-btn" style="margin: 0px 10px 0px 10px" on:click={closeModal}>Cancel</button>
        <!-- export -->
        <button>Export</button>
    </section>
</main>

<style lang="scss">
    @import "public/guideline";
    
    main{
        width: 600px; height: fit-content;

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