<script lang="ts">
    import type { menuItem } from "../GeneralAppControl/DropdownControl.svelte";

    export let options : menuItem;
    export let alignLeft = true;

    let hovered = false;
</script>

<main title={options.title} class="{hovered ? "hovered" : ""} {alignLeft? "align-left" : "align-right"}"
    on:mouseup={options.cta}
    on:mouseover={() => {hovered = true}} on:focus={undefined}
    on:mouseleave={() => {hovered = false}} on:blur={undefined}>

    <section>
        <!-- icons -->
        {#if !!options.iconSrc}
            <img src={options.iconSrc} alt="" width=15px height=15px/>
        {/if}
        <!-- title -->
        <p id="title">{options.title}</p>

    </section>

    <!-- description -->
    {#if !!options.desc}
        <p id="desc">{options.desc}</p>
    {/if}
</main>

<style lang="scss">
    @import "../../../../public/guideline";

    main{
        min-width:100%; width:fit-content; height:27px;
        border-radius: 5px;
        margin: 0px;
        background-color: none;
        display: flex; justify-content: space-between; align-items: center;
        cursor:pointer;
        user-select: none; -webkit-user-select: none;

        &.align-left{
            flex-direction: row;
            section{
                flex-direction: row;
                img{ margin: 0px 0px 0px 7px }
                #title{ margin: 0px 7px 0px 11px }
            }
        } &.align-right{
            flex-direction: row-reverse;
            section{
                flex-direction: row-reverse;
                img{ margin: 0px 11px 0px 7px }
                #title{ margin: 0px }
            }
        }

        &.hovered{
            background-color: $accent;

            #desc{
                color: $secondary !important;
                opacity: 1 !important;
            }

            section{
                img{
                    filter: invert(1); opacity: 1 !important;
                }
                #title{
                    color: $secondary
                }
            }
        }

        #desc{
            color: $secondary !important;
            opacity: 0.3 !important;
        }

        section{
            display: flex; align-items: center;

            img{
                filter: invert(1);
                opacity: 0.7 !important;
            }

            #title{
                color:$secondarys4;
                font-size: 13px;
                white-space: nowrap;
                font-variation-settings: "wght" 450;
            }
        }

        #desc{
            color:$secondarys6;
            font-size: 13px;
            margin: 0px 7px 0px 75px;
            white-space: nowrap;    
        }
    }
</style>