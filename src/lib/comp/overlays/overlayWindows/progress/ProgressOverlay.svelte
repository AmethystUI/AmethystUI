<script lang="ts">
    import { overlayReady } from "../../overlayManager";
    import { progressOverlayData } from "./progressOverlayManager";
    import { onMount } from "svelte";
    import { expoOut, linear  } from "svelte/easing";
    import { tweened } from "svelte/motion";
    import { fade, fly } from "svelte/transition";

    onMount(() => {
        setTimeout(() => { $overlayReady = true }, 300);
    });

    $: realProgress = $progressOverlayData.currentStep / $progressOverlayData.totalSteps * 100;
    $: progressTween.set(realProgress); // update the tween dynamically
    const progressTween = tweened(0, {
		duration: 300,
		easing: linear
	});
</script>

<section in:fly={{y: -50, opacity: 0, duration:700, delay: 100, easing: expoOut}}>
    <div class="progress-bar" style="background: conic-gradient(hsl(270,100%,60%) {$progressTween}%, transparent 0%)"></div>
    
    <p>{$progressOverlayData.taskName}</p>

    <p id="descriptor">{$progressOverlayData.stepDescription ?? ""}</p>
</section>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    section{
        display: flex; justify-content: center; align-items: center; flex-direction: column;
        transform: translate(0px, 20px);

        .progress-bar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 5px solid $accentl1;
        }

        p{
            &#descriptor{
                font-size: 14px;
                position: absolute;
                bottom: 0;
                transform: translateY(60px);
                color: $secondarys5;
            }

            margin-top: 27px;
            font-size: 18px;
            color: $secondary;
        }
    }
</style>