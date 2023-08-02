<script lang="ts">
    import { canvasStatus } from "$lib/stores/canvasStatus";
</script>

<main title="Canvas zoom">
    <p>
        {Math.round($canvasStatus.zoom * 100)}%
    </p>
    
    <img class="more-options" src="$assets/icons/chevron-down.svg" alt="">
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    
    main{
        height:32px; width:100px;
        border-radius: 7px;
        margin-right: 7px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: background-color 200ms ease;
        border: 1px solid $primaryl5;
        display: flex; align-items: center; justify-content: space-between;

        p{
            font-size: 15px;
            color: $secondarys4;
            margin-left: 10px;
            font-family: "Inter";
            font-variation-settings: "wght" 450;
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
        }    

        img{
            filter: invert(1); opacity: 0.5;
            height:24px;
            transition: filter 200ms ease;
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
        }

        .more-options{
            height:20px;
            transform: translate3d(2px,0px,0px);
            margin-right: 10px;
            user-select: none; -webkit-user-select: none; -webkit-user-drag: none;
        }
    }
</style>