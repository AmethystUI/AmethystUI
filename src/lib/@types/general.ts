import * as t from "io-ts";
import { _elementStyle } from "./element";

// IOTS Codecs
export const _HTMLtags = t.union([
    t.literal("A"),
    t.literal("BODY"),
    t.literal("BUTTON"),
    t.literal("CANVAS"),
    t.literal("DIV"),
    t.literal("H1"),
    t.literal("H2"),
    t.literal("H3"),
    t.literal("H4"),
    t.literal("H5"),
    t.literal("H6"),
    t.literal("HR"),
    t.literal("INPUT"),
    t.literal("OL"),
    t.literal("UL"),
    t.literal("PROGRESS"),
    t.literal("P"),
    t.literal("SECTION"),
    t.literal("SPAN"),
    t.literal("TEXTAREA"),
]);

export const _override = t.type({
    name: t.string,
    style: _elementStyle
});
export const _element = t.type({
    type: _HTMLtags,
    showing: t.boolean,
    style: _elementStyle,
    styleOverrides: t.array(_override),
    showOutline: t.boolean
});
export const _project = t.type({
    name: t.string,
    exportDate: t.number,
    content: t.array(_element)
});



// Global usable types
declare global {
    type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N
        ? Acc[number]
        : Enumerate<N, [...Acc, Acc["length"]]>
    
    type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>
    
    type HTMLtags = t.TypeOf<typeof _HTMLtags>;
    
    type override = t.TypeOf<typeof _override>;
    type element = t.TypeOf<typeof _element>;    
    type project = t.TypeOf<typeof _project>;    
}

// Google font api key: AIzaSyB0YyT0-3AgT2aF45O4HropOlNx1hghmaI
// Tester key:          AIzaSyDW3JQmec-yJykfP-FcRYpIujOc6jYa4RQ