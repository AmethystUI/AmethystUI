<script lang="ts" context="module">
    import { addComponent } from "../../stores/collection";
    import type { elementStyle } from "../../types/element";
    import { HTMltagInfo } from "../../types/general";

    // define default values
    const defaultDivStyle:elementStyle = {}

    // define menus here so we can edit them from outside of this component
    export let addMenuItems:menuItem[] = [
        { // div
            type : "reg",
            title : HTMltagInfo["DIV"].name,
            iconSrc : HTMltagInfo["DIV"].iconURI,
            desc: "<div>",
            cta : () => {addComponent("DIV", {}, true)}
        },{ // section
            type : "reg",
            title : HTMltagInfo["SECTION"].name,
            iconSrc : HTMltagInfo["SECTION"].iconURI,
            desc: "<section>",
            cta : () => {addComponent("SECTION", {}, true)}
        }, { // span
            type : "reg",
            title : HTMltagInfo["SPAN"].name,
            iconSrc : HTMltagInfo["SPAN"].iconURI,
            desc: "<span>",
            cta : () => {addComponent("SPAN", {
                width: {v: 100, u:"fit-content"},
                height: {v: 40, u:"fit-content"},
                paddingTop: {v: 10, u:"px"}, paddingRight: {v: 10, u:"px"}, paddingBottom: {v: 10, u:"px"}, paddingLeft: {v: 10, u:"px"},
                justifyContent: "center", alignItems: "center",
                content: "Special Text",
                USETEXT: true
            }, true)}
        },
        // { // body
        //     type : "reg",
        //     title : HTMltagInfo["BODY"].name,
        //     iconSrc : HTMltagInfo["BODY"].iconURI,
        //     desc: "<body>",
        //     cta : () => {addComponent("BODY", {})}
        // },{ // canvas
        //     type : "reg",
        //     title : HTMltagInfo["CANVAS"].name,
        //     iconSrc : HTMltagInfo["CANVAS"].iconURI,
        //     desc: "<canvas>",
        //     cta : () => {addComponent("CANVAS", {})}
        // },
        
        { // ==========
            type : "sep",
            title : "",
            cta : () => {}
        },
        
        { // h1
            type : "reg",
            title : HTMltagInfo["H1"].name,
            iconSrc : HTMltagInfo["H1"].iconURI,
            desc: "<h1>",
            cta : () => {addComponent("H1", {})}
        },{ // h2
            type : "reg",
            title : HTMltagInfo["H2"].name,
            iconSrc : HTMltagInfo["H2"].iconURI,
            desc: "<h2>",
            cta : () => {addComponent("H2", {})}
        },{ // h3
            type : "reg",
            title : HTMltagInfo["H3"].name,
            iconSrc : HTMltagInfo["H3"].iconURI,
            desc: "<h3>",
            cta : () => {addComponent("H3", {})}
        },{ // h4
            type : "reg",
            title : HTMltagInfo["H4"].name,
            iconSrc : HTMltagInfo["H4"].iconURI,
            desc: "<h4>",
            cta : () => {addComponent("H4", {})}
        },{ // h5
            type : "reg",
            title : HTMltagInfo["H5"].name,
            iconSrc : HTMltagInfo["H5"].iconURI,
            desc: "<h5>",
            cta : () => {addComponent("H5", {})}
        },{ // h6
            type : "reg",
            title : HTMltagInfo["H6"].name,
            iconSrc : HTMltagInfo["H6"].iconURI,
            desc: "<h6>",
            cta : () => {addComponent("H6", {})}
        },{ // paragraph
            type : "reg",
            title : HTMltagInfo["P"].name,
            iconSrc : HTMltagInfo["P"].iconURI,
            desc: "<p>",
            cta : () => {addComponent("P", {})}
        },{ // anchor
            type : "reg",
            title : HTMltagInfo["A"].name,
            iconSrc : HTMltagInfo["A"].iconURI,
            desc: "<a>",
            cta : () => {addComponent("A", {})}
        },
        
        { // ==========
            type : "sep",
            title : "",
            cta : () => {}
        },
        
        { // button
            type : "reg",
            title : HTMltagInfo["BUTTON"].name,
            iconSrc : HTMltagInfo["BUTTON"].iconURI,
            desc: "<button>",
            cta : () => {addComponent("BUTTON", {})}
        },{ // input
            type : "reg",
            title : HTMltagInfo["INPUT"].name,
            iconSrc : HTMltagInfo["INPUT"].iconURI,
            desc: "<input>",
            cta : () => {addComponent("INPUT", {})}
        },{ // textarea
            type : "reg",
            title : HTMltagInfo["TEXTAREA"].name,
            iconSrc : HTMltagInfo["TEXTAREA"].iconURI,
            desc: "<textarea>",
            cta : () => {addComponent("TEXTAREA", {})}
        },
        
        // { // label
        //     type : "reg",
        //     title : HTMltagInfo["LABEL"].name,
        //     iconSrc : HTMltagInfo["LABEL"].iconURI,
        //     desc: "<label>",
        //     cta : () => {addComponent("LABEL", {})}
        // },
        
        { // ==========
            type : "sep",
            title : "",
            cta : () => {}
        },
        
        // { // ol
        //     type : "reg",
        //     title : HTMltagInfo["OL"].name,
        //     iconSrc : HTMltagInfo["OL"].iconURI,
        //     desc: "<ol>",
        //     cta : () => {addComponent("OL", {})}
        // },{ // ul
        //     type : "reg",
        //     title : HTMltagInfo["UL"].name,
        //     iconSrc : HTMltagInfo["UL"].iconURI,
        //     desc: "<ul>",
        //     cta : () => {addComponent("UL", {})}
        // },{ // ==========
        //     type : "sep",
        //     title : "",
        //     cta : () => {}
        // },

        { // hr
            type : "reg",
            title : HTMltagInfo["HR"].name,
            iconSrc : HTMltagInfo["HR"].iconURI,
            desc: "<hr>",
            cta : () => {addComponent("HR", {})}
        },{ // progress
            type : "reg",
            title : HTMltagInfo["PROGRESS"].name,
            iconSrc : HTMltagInfo["PROGRESS"].iconURI,
            desc: "<progress>",
            cta : () => {addComponent("PROGRESS", {})}
        },
    ]
</script>

<script lang="ts">
    import FileNameEditor from "../ctrlMenuItems/FileNameEditor.svelte";
    import GeneralAppControl from "../ctrlMenuItems/GeneralAppControl.svelte";
    import DropdownControl, { menuItem } from "../ctrlMenuItems/GeneralAppControl/DropdownControl.svelte";

    export let leftMenuWidth:number;
    let appControlContWidth = 0;
    const appCtrlContWidthChange = (evt:CustomEvent<any>):void => {
        appControlContWidth = evt.detail.width;
    };

    // dropdown control stuff
    let dropdownStatus = {
        currentID : "",
        active : false,
    }
    const toggleDropdown = () => {
        dropdownStatus.active = !dropdownStatus.active;
        // reset global mouse down
        document.onmouseup = undefined;
        
        // if active, set global mouseup so that any click outside of the box will togggle again. Give it a bit of delay so it works
        setTimeout(() => {
            if(dropdownStatus.active){
                document.onmouseup = e => {
                    dropdownStatus.active = false;
                };
                return;
            }
        }, 0);
    };
    const forceOpenDropdown = () => {
        setTimeout(() => {
            dropdownStatus.active = true;
        },0)
    }
    const updateCurrentID = (evt:CustomEvent<any>) => {
        dropdownStatus.currentID = evt.detail.newID;
    };
</script>

<!-- HTML -->
<main style="position:absolute; width:calc(100vw - {leftMenuWidth}px); position:absolute; left:{leftMenuWidth}px">
    <!-- add elements -->
    <section id="left-ctrl">
        <DropdownControl imageURI="./assets/icons/plus.svg" alt="Add element" id="addElement" items={addMenuItems} {...dropdownStatus} on:toggleDropdown={toggleDropdown} on:forceOpenDropdown={forceOpenDropdown} on:updateCurrentID={updateCurrentID} evenSpacing={true}/>
    
        <section>
            <FileNameEditor leftMenuWidth={leftMenuWidth} controlSectionWidth={appControlContWidth}/>
            <div id="fileNameGrad"></div>
        </section>
    </section>

    <GeneralAppControl on:widthChange={appCtrlContWidthChange} on:toggleDropdown={toggleDropdown}  on:forceOpenDropdown={forceOpenDropdown} on:updateCurrentID={updateCurrentID}/>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../../../public/guideline";

    main{
        height:65px;
        top:0;
        background-color: $primaryl1;
        border-bottom: 1px solid $primaryl4;
        z-index: 9998;
        display:flex; justify-content: flex-start; align-items: center;
        transform: translate3d(1px,0px,0px);
        
        #left-ctrl{
            display: flex; align-items: center; height:100%;
            background-color: $primaryl1;
            z-index: 2;

            section{
                position: relative;
                #fileNameGrad{
                    position: absolute; top:0px; right:-20px;
                    height:120%; width:20px;
                    background: linear-gradient(90deg, $primaryl1 0%, hsla(200, 5%, 14%, 0%) 100%);
                }
            }
        }
    }
</style>