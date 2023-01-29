import { writable, get } from 'svelte/store';

export interface canvStat{
    x : number,
    y : number,
    zoom : number,
    darkMode : boolean
};

export let canvasStatus = writable<canvStat>({
    x: 0,
    y: 0,
    zoom : 1,
    darkMode : false
});