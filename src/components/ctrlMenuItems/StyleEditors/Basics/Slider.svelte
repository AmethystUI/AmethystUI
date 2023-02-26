<script lang="ts">
    import type { color } from '../../../../stores/collection';
    import { createEventDispatcher } from 'svelte';
    import Title from './Title.svelte';
    const disp = createEventDispatcher();
        
    export let name:string;
    export let sub = false;

    export let min:number;
    export let max:number;
    export let v: number;
    export let psuedoV: number = v;
    export let hasMargin: boolean;
    export let colorRef: color = undefined;

    let initialCursorY:number = 0;

    export let currentParentWidth=360;

    let sliderBackground:HTMLDivElement;
    $: knobDist = (v>max?max:v)/max * (!!sliderBackground ? sliderBackground.getBoundingClientRect().width-12 : 0) + 6 + (currentParentWidth*0); // currentParentWidth for updating when parent changes size
    // I don't know why I need this currentParentWidth * 0 but the slider wont fucking work without it.

    const startDrag = (e:MouseEvent) => {
        // record initial cursorY
        initialCursorY = e.clientY;

        // update value first
        if(!sliderBackground) return; // do not track if it's not initialized fully
        
        const sliderBCR = sliderBackground.getBoundingClientRect();
        v = ((e.clientX - sliderBCR.x)/(sliderBCR.width))*(max-min)+min;
        // check v range
        if(v < min) v = min;
        if(v > max) v = max;
        
        // dispatch an update value
        disp("updateValue", {
            v:Math.round(v)
        })

        // reset psuedoV
        psuedoV = v;

        // start tracking mouse position on move
        document.addEventListener('mousemove', trackDrag);
        document.addEventListener('mouseup', endDrag);
    }

    const trackDrag = (e:MouseEvent) => {
        e.preventDefault();
        
        const sliderBCR = sliderBackground.getBoundingClientRect();
        // calcuate V
        let tV = ((e.clientX - sliderBCR.x)/sliderBCR.width)*(max-min)+min;

        // calculate deltaV based off of mouse Y deviation
        let invYFacStrength = 10; // smaller = stronger
        let yFacThreshold = 2;
        let yFac = 1/(Math.abs(e.clientY - initialCursorY)/invYFacStrength < yFacThreshold ? 1 : Math.abs(e.clientY - initialCursorY)/invYFacStrength)
        let dV = (tV - psuedoV) * yFac;

        // assign dV
        v += dV;
        // check v range
        v = Math.max(min, Math.min(max, v));
        
        // dispatch an update value
        disp("updateValue", {
            v:Math.round(v)
        })

        // assign psuedoV
        psuedoV = tV;
    }

    const endDrag = () => {
        document.removeEventListener('mousemove', trackDrag);
        document.removeEventListener('mouseup', endDrag);
    }
</script>

<main style={`${hasMargin ? "margin-right:15px" : ""};`}>
    <Title name={name} sub={sub}/>

    <section id="control">
        <section id="slider-container" on:mousedown={startDrag}>
            <div bind:this={sliderBackground} id="slider-background">
                <div id="slider-foreground" style={`transform: scaleX(${v/max*100}%); ${colorRef !== undefined ? `background-color: hsl(${colorRef.h}deg, ${colorRef.s}%, ${colorRef.l}%)` : ""}`}></div>
            </div>
                <div id="slider-knob" style={`transform: translate3d(${knobDist-6}px, 0px, 0px);`}
                on:mousedown={startDrag}></div>
        </section>
    </section>
</main>

<style lang="scss">
    @import "../../../../../public/guideline";

    main{
        width:100%;

        #control{
            display:flex; justify-content: center; align-items: center;
            height: fit-content;

            #slider-container{
                width:100%; height:24px;
                position: relative;
                display:flex; justify-content: flex-start; align-items: center;

                #slider-background{
                    width:100%; height: 4px; border-radius: 4px;
                    background-color: $secondarys7;
                    overflow:hidden;

                    #slider-foreground{
                        background-color: $accentl1;
                        height:100%;
                        width:100%;
                        transform-origin: left;
                    }
                }

                #slider-knob{
                    position:absolute;
                    background-color: $secondarys4;
                    width:12px; height:12px; border-radius: 16px;
                    box-shadow: 0 2px 4px hsla(0,0%,0%,32%);
                }
            }
        }
    }
</style>