/**
 * This module contains configuration options for the font planner (backend) and font loader (frontend).
 */

/**
 * Enum representing the sorting options for the Google Fonts API.
 * 
 * @enum {string}
 */
export enum SortBy {
    Alpha = 'alpha',
    Date = 'date',
    Popularity = 'popularity',
    Style = 'style',
    Trending = 'trending'
}

/**
 * The sorting option for the Google Fonts API.
 * 
 * @type {SortBy}
 */
export const fontSorting: SortBy = SortBy.Popularity;

/**
 * The limit for the number of fonts to be loaded.
 * 
 * @type {number}
 */
export const fontLimit: number = 100;

/**
 * The amountt of simultaneous call to Google Fonts
 */
export const batchSize: number = 100;