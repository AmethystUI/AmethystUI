<script lang="ts" context="module">
    import { addComponent } from "../../stores/collection";
    import type { elementStyle } from "../../types/element";
    import { HTMltagInfo, units } from "../../types/general";

    const commonHeadingStyles: elementStyle = {
        width: {v: 120, u: "fit-content"},
        height: {v: 30, u: "fit-content"},
        justifyContent: "center", alignItems: "flex-start",
        USETEXT: true,
    }

    // define menus here so we can edit them from outside of this component
    export let addMenuItems:menuItem[] = [
        { // div
            type : "reg",
            title : HTMltagInfo["DIV"].name,
            iconSrc : HTMltagInfo["DIV"].iconURI,
            desc: "<div>",
            cta : () => {addComponent("DIV", {})}
        },{ // section
            type : "reg",
            title : HTMltagInfo["SECTION"].name,
            iconSrc : HTMltagInfo["SECTION"].iconURI,
            desc: "<section>",
            cta : () => {addComponent("SECTION", {})}
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
                leadingContent: "Special Style Text",
                USETEXT: true
            })}
        },
        // { // body
        //     type : "reg",
        //     title : HTMltagInfo["BODY"].name,
        //     iconSrc : HTMltagInfo["BODY"].iconURI,
        //     desc: "<body>",
        //     cta : () => {addComponent("BODY", {})}
        // },

        { // canvas
            type : "reg",
            title : HTMltagInfo["CANVAS"].name,
            iconSrc : HTMltagInfo["CANVAS"].iconURI,
            desc: "<canvas>",
            cta : () => {addComponent("CANVAS", {
                width: {v: 400, u:"px"},
                height: {v: 250, u:"px"},
            })}
        },
        
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
            cta : () => { addComponent("H1", {
                ...commonHeadingStyles,
                leadingContent: "Title",
                typeStyle: {
                    size: {v: 48, u: "pt"},
                    lineHeight: {v: 105, u: "%"},
                    variation: 700
                }
            })}
        },{ // h2
            type : "reg",
            title : HTMltagInfo["H2"].name,
            iconSrc : HTMltagInfo["H2"].iconURI,
            desc: "<h2>",
            cta : () => {addComponent("H2", {
                ...commonHeadingStyles,
                leadingContent: "Subtitle",
                typeStyle: {
                    size: {v: 32, u: "pt"},
                    lineHeight: {v: 110, u: "%"},
                    variation: 400
                }
            })}
        },{ // h3
            type : "reg",
            title : HTMltagInfo["H3"].name,
            iconSrc : HTMltagInfo["H3"].iconURI,
            desc: "<h3>",
            cta : () => {addComponent("H3", {
                ...commonHeadingStyles,
                USETEXT: true,
                leadingContent: "Heading",
                typeStyle: {
                    size: {v: 28, u: "pt"},
                    lineHeight: {v: 110, u: "%"},
                    variation: 700
                }
            })}
        },{ // h4
            type : "reg",
            title : HTMltagInfo["H4"].name,
            iconSrc : HTMltagInfo["H4"].iconURI,
            desc: "<h4>",
            cta : () => {addComponent("H4", {
                ...commonHeadingStyles,
                leadingContent: "Heading 2",
                typeStyle: {
                    size: {v: 22, u: "pt"},
                    lineHeight: {v: 110, u: "%"},
                    variation: 700
                }
            })}
        },{ // h5
            type : "reg",
            title : HTMltagInfo["H5"].name,
            iconSrc : HTMltagInfo["H5"].iconURI,
            desc: "<h5>",
            cta : () => {addComponent("H5", {
                ...commonHeadingStyles,
                USETEXT: true,
                leadingContent: "Heading 3",
                typeStyle: {
                    size: {v: 18, u: "pt"},
                    lineHeight: {v: 120, u: "%"},
                    variation: 400
                }
            })}
        },{ // h6
            type : "reg",
            title : HTMltagInfo["H6"].name,
            iconSrc : HTMltagInfo["H6"].iconURI,
            desc: "<h6>",
            cta : () => {addComponent("H6", {
                ...commonHeadingStyles,
                leadingContent: "Caption",
                typeStyle: {
                    size: {v: 10, u: "pt"},
                    lineHeight: {v: 120, u: "%"},
                    casing: "uppercase",
                    variation: 700
                }
            })}
        },{ // paragraph
            type : "reg",
            title : HTMltagInfo["P"].name,
            iconSrc : HTMltagInfo["P"].iconURI,
            desc: "<p>",
            cta : () => {addComponent("P", {
                width: {v: 200, u: "px"},
                height: {v: 30, u: "fit-content"},
                justifyContent: "center", alignItems: "flex-start",
                
                USETEXT: true,
                leadingContent: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
                typeStyle: {
                    size: {v: 11, u: "pt"},
                    lineHeight: {v: 130, u: "%"},
                    variation: 400
                }
            })}
        },{ // anchor
            type : "reg",
            title : HTMltagInfo["A"].name,
            iconSrc : HTMltagInfo["A"].iconURI,
            desc: "<a>",
            cta : () => {addComponent("A", {
                width: {v: 80, u: "fit-content"},
                height: {v: 30, u: "fit-content"},
                justifyContent: "center", alignItems: "center",
                
                USETEXT: true,
                leadingContent: "Anchor Link",
                color: initializeColorFromHSLA(220, 100, 63, 100),
                typeStyle: {
                    size: {v: 11, u: "pt"},
                    lineHeight: {v: 130, u: "%"},
                    textDecorations: ["underline"],
                    variation: 400
                }
            })}
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
            cta : () => {addComponent("BUTTON", {
                width: {v: 105, u: "fit-content"}, height: {v: 38, u: "fit-content"},
                paddingTop: {v: 10, u:"px"}, paddingRight: {v: 20, u:"px"}, paddingBottom: {v: 10, u:"px"}, paddingLeft: {v: 20, u:"px"},
                justifyContent: "center", alignItems: "center",
                
                USEBACKGROUND: true, backgroundColor: initializeColorFromHSLA(0, 0, 0, 0),

                USEBORDER: true, borderColor: initializeColorFromHSLA(268, 91, 55, 100),
                
                USETEXT: true,
                leadingContent: "Click Me",
                typeStyle: {
                    tracking: {v: 0.5, u: "px"},
                    alignment: "center",
                }
            })}
        },{ // input
            type : "reg",
            title : HTMltagInfo["INPUT"].name,
            iconSrc : HTMltagInfo["INPUT"].iconURI,
            desc: "<input>",
            cta : () => {addComponent("INPUT", {
                width: {v: 296, u: "px"}, height: {v: 50, u: "fit-content"},
                paddingTop: {v: 2, u:"px"}, paddingRight: {v: 2, u:"px"}, paddingBottom: {v: 2, u:"px"}, paddingLeft: {v: 2, u:"px"},
                
                USEBACKGROUND: true, backgroundColor: initializeColorFromHSLA(200, 2, 17, 100),
                
                USEBORDER: true,
                borderColor: initializeColorFromHSLA(0, 0, 100, 100),
                borderStyleTop: "hidden", borderStyleRight: "hidden", borderStyleBottom: "hidden", borderStyleLeft: "hidden",
                borderRadiusTop: {v: 6, u:"pt"}, borderRadiusRight: {v: 6, u:"pt"}, borderRadiusBottom: {v: 6, u:"pt"}, borderRadiusLeft: {v: 6, u:"pt"},

                USETEXT: true,
                placeholder: "⚡︎  Try writing something here",
                color: initializeColorFromHSLA(0, 0, 90, 100),
                typeStyle: {
                    alignment: "center",
                    size: {v: 10, u: "pt"},
                },

                USESHADOW: true,
                boxShadows: [{
                    color: initializeColorFromHSLA(0, 0, 0, 30),
                    x: {v: 10, u:"px"},
                    y: {v: 10, u:"px"},
                    radius: {v: 15, u:"px"},
                    grow: {v: 0, u:"px"},
                }]
            })}
        },{ // textarea
            type : "reg",
            title : HTMltagInfo["TEXTAREA"].name,
            iconSrc : HTMltagInfo["TEXTAREA"].iconURI,
            desc: "<textarea>",
            cta : () => {addComponent("TEXTAREA", {
                width: {v: 280, u: "px"}, height: {v: 180, u: "px"},
                paddingTop: {v: 10, u:"px"}, paddingRight: {v: 10, u:"px"}, paddingBottom: {v: 10, u:"px"}, paddingLeft: {v: 10, u:"px"},
                
                USEBACKGROUND: true, backgroundColor: initializeColorFromHSLA(200, 2, 17, 100),
                
                USEBORDER: true,
                borderColor: initializeColorFromHSLA(0, 0, 100, 100),
                borderStyleTop: "hidden", borderStyleRight: "hidden", borderStyleBottom: "hidden", borderStyleLeft: "hidden",
                borderRadiusTop: {v: 6, u:"pt"}, borderRadiusRight: {v: 6, u:"pt"}, borderRadiusBottom: {v: 6, u:"pt"}, borderRadiusLeft: {v: 6, u:"pt"},

                USETEXT: true,
                placeholder: `Write your review here:

E.g. "This app fucking sucks."`,
                color: initializeColorFromHSLA(0, 0, 90, 100),
                typeStyle: {
                    size: {v: 10, u: "pt"},
                    lineHeight: {v: 120, u: "%"},
                },

                USESHADOW: true,
                boxShadows: [{
                    color: initializeColorFromHSLA(0, 0, 0, 30),
                    x: {v: 10, u:"px"},
                    y: {v: 10, u:"px"},
                    radius: {v: 15, u:"px"},
                    grow: {v: 0, u:"px"},
                }]
            })}
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
    import { defaultMouseDownAction } from "../../App.svelte";
    import { initializeColorFromHSLA } from "../../util/colorMaths";

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

    const closeOverlay = (e?: MouseEvent | KeyboardEvent) => { // this function should close any overlay that is open
        // change activation to false, and then remove all the global listeners for listening to close
        dropdownStatus.active = false;
        
        setTimeout(() => { // add these at the next tick so the overlay can be opened again
            if(e) defaultMouseDownAction(e); // activate the default mouse down action first because we have technically already clicked.
            document.onmousedown = defaultMouseDownAction;
        }, 0);
    }
    const openOverlay = () => { // this function should open the overlay that has the matching ID
        // change activation to true, and then add some global listeners for listening to close
        dropdownStatus.active = true;
        
        setTimeout(() => { // add these at the next tick so that the overlay is not closed before the menu is opened
            document.onmousedown = e => closeOverlay(e);
            document.onkeydown = (e) => {
                if(e.key === "Escape") closeOverlay(e)
            };
        }, 0);
    }

    const toggleDropdown = () => {        
        // toggle the activation state and open / close the overlay
        if(dropdownStatus.active){ // our initial state is open. We need to close it
            closeOverlay();
        } else {
            openOverlay();
        }
    };
    const keepOpenDropdown = () => {
        setTimeout(() => {
            dropdownStatus.active = true;
        }, 0)
    }
    const updateCurrentID = (evt:CustomEvent<any>) => {
        dropdownStatus.currentID = evt.detail.newID;
    };
</script>

<!-- HTML -->
<main style="position:absolute; width:calc(100vw - {leftMenuWidth}px); position:absolute; left:{leftMenuWidth}px">
    <!-- add elements -->
    <section id="left-ctrl">
        <DropdownControl imageURI="./assets/icons/plus.svg" alt="Add element" id="addElement" items={addMenuItems} {...dropdownStatus} on:openDropdown={openOverlay} on:closeDropdown={() => closeOverlay()} on:keepOpenDropdown={keepOpenDropdown} on:updateCurrentID={updateCurrentID} evenSpacing={true}/>
    
        <section>
            <FileNameEditor leftMenuWidth={leftMenuWidth} controlSectionWidth={appControlContWidth}/>
            <div id="fileNameGrad"></div>
        </section>
    </section>

    <GeneralAppControl on:widthChange={appCtrlContWidthChange} on:toggleDropdown={toggleDropdown}  on:forceOpenDropdown={keepOpenDropdown} on:updateCurrentID={updateCurrentID}/>
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