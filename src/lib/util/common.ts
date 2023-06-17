import { defaultCSSStyles } from "../@const/element.const";

// This module contains many basic functions that are used throughout the app, such as deep object comparison.
const _ = {
    isEqual: function (...items: Object[]): boolean {
        // fetch keys from every obj to see if they are equal first
        const root = items[0];
        if(root === undefined) return false; // do not compare undefined values

        // check if the root is an iterable object or not
        const rootKey = Object.keys(root);

        if(rootKey.length > 0){
            for (let i = 1; i < items.length; i++) {
                // loop through each key and compare values
                if(items[i] === undefined) return false; // do not compare undefined values
                const itemKey = Object.keys(items[i]);
                
                // if the keys do not have the same number of items, they are not equal and we can return false
                if (rootKey.length !== itemKey.length) return false;
                
                // compare keys
                for (let j = 0; j < rootKey.length; j++) {
                    // if the values are not equal, return false
                    if (root[rootKey[j] ]!== items[i][itemKey[j]]) return false;
                }
            }
    
            return true;
        } else {
            for (let i = 1; i < items.length; i++) {
                // loop through each key and compare values
                if(root !== items[i]) return false;
            }
            return true;
        }
    },
    isUnitedValueZero: function (...items: unitedAttr<number>[]){
        // check if the values are all equal to 0
        return items.every(item => item.v === 0);
    },
    isUnitedValueEqual: function (...items: unitedAttr<number>[]){
        // check if the values are all equal to 0 first
        if(this.isUnitedValueZero(...items)) return true;

        // if not everything is equal to 0, return the result of deep object comparison
        return this.isEqual(...items);
    },
    isDefault: function (htmlTag: HTMLtags, style: elementStyle, attribute: elementStyleKeys): boolean {
        // Check COM for backup
        const defaultVal = defaultCSSStyles[htmlTag][attribute] ?? defaultCSSStyles.COM[attribute];

        // check if default value exists first
        if(defaultVal === undefined){
            return style[attribute] === undefined;
        }

        if(Object.keys(defaultVal).length === 0) return defaultVal === style[attribute]; // non-object comparison
        return this.isUnitedValueEqual(defaultVal, style[attribute]);
    },
    repeatString: function (str: string, numTimes: number): string {
        let result = "";
        for (let i = 0; i < numTimes; i++) {
            result += str;
        }
        return result;
    }
}

export default _;