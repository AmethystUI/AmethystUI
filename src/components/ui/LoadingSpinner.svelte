<script lang="ts">

</script>

<!-- HTML -->
<main>
    <!-- the foreground div -->
    <div></div>
</main>

<!-- STYLE -->
<style lang="scss">
    @import "./public/guideline";

    main{
        width: 50px; height: 10px;
        background-color: $primaryl3;
        border-radius: 100px;
        box-shadow: inset 1px 1px 7px hsla(0deg, 0%, 0%, 50%);

        $bounce-bar-width: 30px;

        div{
            width: $bounce-bar-width; height: 100%;
            border-radius: 100px;
            background-color: $secondary;
            animation: bounce 1s linear infinite;
        }

        @keyframes bounce {
            0% {
                transform: translateX(0);
            }
            50% {
                transform: translateX(calc(50px - $bounce-bar-width));
            }
            100% {
                transform: translateX(0);
            }
            }
    }
</style>