import { writable, get } from 'svelte/store';

export interface canvStat{
    x : number,
    y : number,
    zoom : number,
    darkCanvas : boolean
};

export let canvasStatus = writable<canvStat>({
    x: 0,
    y: 0,
    zoom : 1,
    darkCanvas : true
});