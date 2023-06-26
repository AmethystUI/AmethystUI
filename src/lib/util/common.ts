import { defaultCSSStyles } from "../@const/element.const";
import _ from "lodash";

/**
 * This module contains many basic functions that are used throughout the app, such as deep value comparisons.
 * The purpose is to provide custom behaviors for objects or arrays that lodash does not support. And is taylored to the need of the application.
 * 
 * Since we're using this concurrently with lodash, this module will be called `cutil` for Common Utilities instead of the normal underscore (`_`).
 * 
 * ...It's a really fucking stupid name but whatever.
*/
const cutil = {
    isEqual: function (...items: Object[]): boolean {
        // fetch keys from every obj to see if they are equal first
        const root = items[0];
        if(root === undefined || root === null) return false; // do not compare undefined values

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
                    if(typeof root[rootKey[j]] === "object" && typeof items[i][rootKey[j]] !== "object"){
                        if(!this.isEqual(root[rootKey[j]], items[i][rootKey[j]])) return false;
                    } else if (root[rootKey[j]] !== items[i][itemKey[j]]){
                        return false;
                    }
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
        return items.every(item => !!(item?.v === 0));
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
        console.log(style[attribute]);
        if(style[attribute] === undefined) return true; // do not generate anything if there is no value
        if(defaultVal === undefined) return false; // do not generate anything if there is no value

        if(Object.keys(defaultVal).length === 0) return defaultVal === style[attribute]; // non-object comparison
        return this.isUnitedValueEqual(defaultVal, style[attribute]);
    },
    repeatString: function (str: string, numTimes: number): string {
        let result = "";
        for (let i = 0; i < numTimes; i++) {
            result += str;
        }
        return result;
    },
    findDiff: function (src: elementStyle, ref: elementStyle): elementStyle {
        const result: elementStyle = {};
        
        for (const key in src) {
            if (!ref.hasOwnProperty(key)) {
                // if key from A is not in B, add to result.
                result[key] = src[key];
            } else {
                if (!this.isUnitedValueEqual(src[key], ref[key]) && !_.isEqual(src[key], ref[key])) {
                    result[key] = src[key];
                }
            }
        }
        
        return result;
    }
}

export default cutil;