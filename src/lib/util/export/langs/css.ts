import { searchFontIndex } from "$src/lib/workers/pseudoWorkers/fonts";
import setImmediate from "../../setImmediate";
import { getFontBinaryB64 } from "../exportUtils";

export const exportCSS = async () => {
    try{
        await getFontBinaryB64(JSON.parse(localStorage.getItem("fonts")), "Cinzel", 400);
    } catch (err) {
        console.error(err);
    }
}