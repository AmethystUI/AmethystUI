<script lang="ts">
    import { closeModal } from "../../modalManager";

    const copyLogAndClose = async (): Promise<void> => {
        const log = {
            Version: "AmethystUI Web 0.0.0 Public Alpha",
            UserAgent: navigator.userAgent,
            Language: navigator.language,
            CookiesEnabled: navigator.cookieEnabled,
            ScreenWidth: window.screen.width,
            ScreenHeight: window.screen.height,
            ColorDepth: window.screen.colorDepth,
            Online: navigator.onLine,
            TimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        // Format the log object as a string
        const formattedLog = Object.entries(log)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        // Copy the log to the clipboard
        navigator.clipboard.writeText(formattedLog)
            .catch((error) => {
                console.error('Failed to copy browser log to clipboard:', error);
            }
        );

        closeModal();
    }
</script>

<main>
    <div class="icon-container">
        <img src="/src/assets/svgs/emblem_flat.svg" alt="">
    </div>
    <h2 class="no-drag">Amethyst<span>UI</span></h2>
    <h6>Version 0.0.0 | Public Alpha</h6>
    <h6 class="cpyrt">
        <span>Copyright © 2022-2023 Lemon Foxmere.</span>
        <span>All rights reserved.</span>
    </h6>

    <section>
        <button on:click={copyLogAndClose}>Copy Debug Information</button>
    </section>
</main>

<style lang="scss">
    @import "/src/static/stylesheets/guideline";
    
    main{
        width: 230px; height: fit-content;
        margin: 0px;
        display: flex; justify-content: center; align-items: center; flex-direction: column;

        section{
            width: 100%;

            button{
                width: 100%;
                padding: 8px 0px; margin-top: 15px;
                border: none;
                border-radius: 6px;

                background-color: $accent;
                color: $secondary;
                font-weight: 500;
                
                &:active{
                    background-color: $accentl2;
                }
            }
        }

        .icon-container{
            width: 100px; height: 100px;
            display: flex; justify-content: center; align-items: center;
            margin-bottom: 17px;

            img{
                height: 50px;
                opacity: 0.2;
                margin: 0;
            }
        }

        h6{
            font-size: 12px;
            font-weight: 400;
            color: $secondarys4;
            width: 90%;
            display:flex; justify-content: center; align-items: center; flex-direction: column;
            padding: 3px 0px;
        }
        
        .cpyrt{
            font-size: 10px;
            line-height: 150%;
            text-align: center;
            margin-top: 20px;
        }

        h2{
            font-size: 24px;
            font-weight: 400;
            display:flex; justify-content: center; align-items: center;
            margin-bottom: 20px; padding: 0;
            
            span{
                font-weight: 600;
            }
        }
    }
</style>