<script lang="ts">
    import { progressModalReady, progressModalData } from "$src/lib/stores/modalManager";
    import { onMount } from "svelte";
    import { expoOut, linear  } from "svelte/easing";
    import { tweened } from "svelte/motion";
    import { fade, fly } from "svelte/transition";

    onMount(() => {
        setTimeout(() => { $progressModalReady = true }, 300);
    });

    $: realProgress = $progressModalData.currentStep / $progressModalData.totalSteps * 100;
    $: progressTween.set(realProgress); // update the tween dynamically
    const progressTween = tweened(0, {
		duration: 500,
		easing: linear
	});
</script>

<main transition:fade={{duration:200}}>
    <section transition:fly={{y: -50, opacity: 0, duration:700, delay: 100, easing: expoOut}}>
        <div class="progress-bar" style="background: conic-gradient(hsl(270,100%,60%) {$progressTween}%, transparent 0%)"></div>
        
        <p>{$progressModalData.taskName}</p>

        <p id="descriptor">{$progressModalData.stepDescription ?? ""}</p>
    </section>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    main{
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: none; -webkit-backdrop-filter: blur(50px) brightness(0.7); backdrop-filter: blur(50px) brightness(0.7);
        z-index: 301;
        display: flex; justify-content: center; align-items: center;

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
    }
</style>