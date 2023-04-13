<script lang="ts">
    import { collection, selectedComponent, selectedOverride } from "../../stores/collection";
    import { canvasStatus } from "../../stores/canvasStatus";

    export let leftMenuWidth:number;
    export let rightMenuWidth:number;

    $: currentComponent = $collection[$selectedComponent];
    $: currentOverride = $selectedOverride !== -1 ? $collection[$selectedComponent].styleOverrides[$selectedOverride] : undefined;
    $: currentStyle = (currentOverride?.style ?? currentComponent?.style) ?? undefined;
</script>

<!-- HTML -->
<main class="no-drag {$canvasStatus.darkCanvas ? "darkMode" : "lightMode"}" style="position:absolute; width:calc(100vw - {leftMenuWidth+1}px - {rightMenuWidth-1}px); left: {leftMenuWidth+1}px; overflow:visible">
    
    <section id="hinting-text">
        <pre>
 /| ､
(°､ ｡ 7  \
 |､  ~ヽ  |
 じしf_,)〳
        </pre>

        <h4>Feature Not Available yet.</h4>

        <p>We're still working on making it not awful.</p>

        <a target="_blank" href=".">Prove It</a>
        <div style="min-height: 70px;"></div>
    </section>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "../../../public/guideline";
    $outline-color: $secondarys7;

    main{
        $transitionDuration: 200ms;

        height:calc(100vh - 65px); top:65px;
        display: flex; justify-content: center; align-items: center; flex-direction: column;
        transition: background-color $transitionDuration linear;

        &.darkMode{
            background-color: hsla(0deg, 0%, 98%, 0%);
            
            #hinting-text{
                h4{
                    color: $secondary;
                }
                pre{
                    color: $primaryl4;
                }
                a{
                    color: $primaryl9;
                    border-color: none;

                    &:hover{
                        background: $primaryl9;
                        color: $primary;
                    }
                }
                p{ color: $primaryl7 }
            }
        } &.lightMode{
            background-color: hsla(0deg, 0%, 98%, 100%);
            
            #hinting-text{
                h4{
                    color: $primary;
                }
                pre{
                    color: $primaryl2;
                }
                a{
                    color: $primary;
                    background-color: none;

                    &:hover{
                        background: $primary;
                        color: $secondary;
                    }
                }
                p{ color: $primaryl2 }
            }
        }

        #hinting-text{
            width: fit-content;
            position:absolute; top: 50%; left:50%;
            transform: translate3d(-50%, -50%, 0px);
            user-select: none; -webkit-user-select: none;
            display: flex; justify-content: center; align-items: left; flex-direction: column;

            pre{
                transition: color $transitionDuration linear;
                margin-bottom: 20px; width: 100%; display: flex; justify-content: center;
                font-size: 26px;
                line-height: 34px;
            }

            a{
                transition: $transitionDuration linear;
                transition-property: border-color;
                text-decoration: none;
                font-size: 14px;
                padding: 8px 12px 8px 12px; margin-top: 40px;
                border: 1.5px solid;
                border-radius: 8px;
                font-variation-settings: "wght" 600;
            }

            h4{
                transition: color $transitionDuration linear;
                width: fit-content;
                line-height: 100%;
                margin-bottom: 20px;
            }

            p{
                transition: color $transitionDuration linear;
                width: 350px;
                text-align: left;
                font-size: 16px;
                line-height: 22px;
            }
        }
    }
</style>