<script lang="ts">
    // export let infoType: "info" | "warning" | "error";
    export let info;
    export let tagSize: string = "16px";
    export let margin: string = "0px 0px 0px 0px";

    let cardVisible = false;

    let originalKeyDownFunc: (KeyboardEvent?) => any;
    let originalMouseDownFunc: (MouseEvent?) => any;

    const hideCard = () => {
        if(!cardVisible) return; // already hidden, do not redo it.

        // restore keydown func
        document.onkeydown = originalKeyDownFunc;
        document.onmousedown = originalMouseDownFunc;
        // set visible to false
        cardVisible = false;
    }

    const showCard = () => {
        if(cardVisible) return; // already visible, do not redo it.
        
        // store keydown and mousedown func
        originalKeyDownFunc = document.onkeydown;
        originalMouseDownFunc = document.onmousedown;
        // set visible to true
        cardVisible = true;
        // set keyboard event so that whenever escape is pressed, hide card
        document.onkeydown = (e: KeyboardEvent) => {
            if(e.key === "Escape") hideCard();
        }
        setTimeout(() => {
            document.onmousedown = () => {
                hideCard();
            }
        }, 0);
    }
</script>

<!--HTML -->
<div
class="{cardVisible ? "fullscreen" : ""}"
style="width: {tagSize}; height: {tagSize}; margin:{margin};">
    <img
        src="$assets/icons/info.svg" alt="Info" style="width: {tagSize}; height: {tagSize}"
        on:mousedown={showCard}>

    <div class="card {cardVisible ? "show" : ""}" on:mousedown= {e => e.stopPropagation()}>
        <p>{info}</p>
    </div>
</div>

<!--STYLE -->
<style lang="scss">
    @import "/src/static/stylesheets/guideline";

    div{
        padding: 0px; margin: 0px;
        position: relative;
        border-radius: 200px;

        .card{
            p{
                max-width: 200px; width: max-content;

                font-size: 12px;
                color: $secondary;
                letter-spacing: -0.15px;
                line-height: 14px;

                cursor: text;
            }

            &.show{
                pointer-events: all;
                opacity: 1;

                transform: translate(13px, -50%) scale(100%);
                transition-timing-function: cubic-bezier(0.410, 1.410, 0.625, 1.005);
            }

            transition: 250ms ease;
            transition-property: opacity, transform;

            position: absolute;
            z-index: 10;

            top: 50%; left: 50%;
            transform: translate(13px, -50%) scale(10%);
            transform-origin: -5px 50%;

            max-width: 250px; width: max-content;
            height: fit-content;
            background-color: hsla(200, 5%, 20%, 50%);
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            border: 1.5px solid $primaryl3;

            border-radius: 8px;
            padding: 7px 8px 7px 8px;
            box-sizing: border-box;
            box-shadow: 0px 3px 10px black;

            pointer-events: none;
            opacity: 0;
        }

        img{
            transition: 300ms ease opacity;
            filter: invert(1); opacity: 1;
            margin:0;
        }
    }
</style>