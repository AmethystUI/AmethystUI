// This module contains many basic functions that are used throughout the app, such as deep object comparison.

export default {
    isEqual: (...items: Object[]) => {
        // fetch keys from every obj to see if they are equal first
        const root = items[0];
        const rootKeys = Object.keys(root);
        
        for (let i = 1; i < items.length; i++) {
            // loop through each key and compare values
            const itemKey = Object.keys(items[i]);
            
            // if the keys do not have the same number of items, they are not equal and we can return false
            if (rootKeys.length !== itemKey.length) return false;
            
            // compare keys
            for (let j = 0; j < rootKeys.length; j++) {
                // if the values are not equal, return false
                if (root[rootKeys[j] ]!== items[i][itemKey[j]]) return false;
            }
        }

        return true;
    },
    repeatString: (str: string, numTimes: number): string => {
        let result = "";
        for (let i = 0; i < numTimes; i++) {
            result += str;
        }
        return result;
    }
}