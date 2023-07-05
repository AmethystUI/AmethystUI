<script lang="ts">
    import { overlayReady } from "../../overlayManager";
    import { progressOverlayData } from "./progressOverlayManager";
    import { onMount } from "svelte";
    import { expoOut } from "svelte/easing";
    import { fly } from "svelte/transition";

    onMount(() => {
        setTimeout(() => { $overlayReady = true }, 300);
    });

    $: realProgress = $progressOverlayData.currentStep / $progressOverlayData.totalSteps * 100;
</script>

<section in:fly={{y: -50, opacity: 0, duration:700, delay: 100, easing: expoOut}} style="transform: scale(90%)">
    <div class="ko-progress-circle" data-progress={Math.round(realProgress)}>
        {#if $progressOverlayData.state === "success"}
            <svg id="check" width="80%" height="80%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:1.5;">
                <g transform="matrix(1,0,0,1,-0.0411666,0.0443693)">
                    <path d="M5.043,11.758L9.847,16.96L19.033,6.871" style="fill:none; stroke: #fff; stroke-width:2.5px;"/>
                </g>

            </svg>
        {:else if $progressOverlayData.state === "error"}
            <svg id="cross" width="90%" height="90%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd; stroke-linecap:round; stroke-linejoin:round; stroke-miterlimit:1.5;">
                <path id="c1" d="M6.99,7L16.999,17.004" style="fill:none; stroke:#fff; stroke-width:2px;"/>
                <g transform="matrix(-0.000291324,1,-1,-0.000291324,24,0.0109899)">
                    <path id="c2" d="M6.99,7L16.999,17.004" style="fill:none;stroke:#fff;stroke-width:2px;"/>
                </g>
            </svg>
        {/if}
        
        <div class="ko-circle">
            <div class="full ko-progress-circle__slice">
                <div class="ko-progress-circle__fill"></div>
            </div>
            <div class="ko-progress-circle__slice">
                <div class="ko-progress-circle__fill"></div>
                <div class="ko-progress-circle__fill ko-progress-circle__bar"></div>
            </div>
        </div>
    </div>
    
    <p>{$progressOverlayData.taskName}</p>

    <p id="descriptor">{$progressOverlayData.stepDescription ?? ""}</p>
</section>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    $circle-size: 60px;
    $circle-background: transparent;
    $circle-color: $accentl1;
    $transition-length: 500ms;

    .ko-progress-circle {
        position: relative;
        margin: 20px 0px;
        width:  $circle-size;
        height: $circle-size;
        display: flex; justify-content: center; align-items: center;

        background-color: $circle-background;
        outline: 6px solid $accentl1;
        outline-offset: -1px;

        border-radius: 50%;
        .ko-progress-circle__slice, .ko-progress-circle__fill {
            position: absolute; top: 0; left: 0;
            width:    $circle-size;
            height:   $circle-size;
            position: absolute;
            backface-visibility: hidden; -webkit-backface-visibility: hidden;
            transition: transform $transition-length linear;
            border-radius: 50%;
        }
        .ko-progress-circle__slice {
            position: absolute; top: 0; left: 0;
            clip: rect(0px, $circle-size, $circle-size, $circle-size/2);
            .ko-progress-circle__fill {
                clip: rect(0px, $circle-size/2, $circle-size, 0px);
                background-color: $circle-color;
            }
        }

        $i: 0;
        $increment: 180deg / 100;
        @while $i <= 100 {
            &[data-progress='#{$i}'] {
                .ko-progress-circle__slice.full, .ko-progress-circle__fill {
                    transform: rotate($increment * $i);
                }	
                .ko-progress-circle__fill.ko-progress-circle__bar {
                    transform: rotate($increment * $i * 2);
                }
                $i: $i + 1;
            }
        }

        svg{
            position: absolute;
            z-index: 2;

            path{
                stroke-dasharray: 100%;
                stroke-dashoffset: 100%;
                animation: dash 300ms linear;
                animation-fill-mode: forwards;
            }

            &#check{
                transform: translate(0px, 1.25px);
            }
            &#cross{
                transform: translate(0px, 0.5px);
                
                path{
                    &#c1{
                        animation-delay: 150ms;
                    } &#c2{
                        animation-delay: 300ms;
                    }
                }
            }
        }
    }
    
    section{
        display: flex; justify-content: center; align-items: center; flex-direction: column;
        transform: translate(0px, 20px);

        p{
            margin-top: 27px;
            font-size: 20px;
            color: $secondary;
            display: flex; justify-content: center; align-items: center;

            &#descriptor{
                font-size: 14px;
                width: min(calc(100vw - 20px), 500px);
                position: absolute;
                bottom: 0;
                transform: translateY(60px);
                color: $secondarys5;
            }

        }
    }

    @keyframes dash {
        to {
            stroke-dashoffset: 0%;
        }
    }
</style>