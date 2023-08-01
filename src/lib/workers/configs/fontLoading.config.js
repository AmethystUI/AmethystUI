/**
 * This module contains configuration options for the font planner (backend) and font loader (frontend).
 */
/**
 * Enum representing the sorting options for the Google Fonts API.
 *
 * @enum {string}
 */
export var SortBy;
(function (SortBy) {
    SortBy["Alpha"] = "alpha";
    SortBy["Date"] = "date";
    SortBy["Popularity"] = "popularity";
    SortBy["Style"] = "style";
    SortBy["Trending"] = "trending";
})(SortBy || (SortBy = {}));
/**
 * The sorting option for the Google Fonts API.
 *
 * @type {SortBy}
 */
export const fontSorting = SortBy.Popularity;
/**
 * The limit for the number of fonts to be loaded.
 *
 * @type {number}
 */
export const fontLimit = 300;
/**
 * The amountt of simultaneous call to Google Fonts
 */
export const batchSize = 100;
//# sourceMappingURL=fontLoading.config.js.map