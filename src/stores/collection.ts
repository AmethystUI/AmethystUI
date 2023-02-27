import { writable, get } from 'svelte/store';
import type { units, textDecoration, textCasing, textAlignment, colorNumericType, overflow, borderOutlineStyle, displayTypes, flexAlignment, flexDirection, HTMLtag, unitedAttr, boxShadow, color, element, typographyStyle } from '../declarations/general';

// all caps attributes are used as compilation tags
export interface elementStyle{
    USEBACKGROUND? : boolean; // done
    backgroundColor? : color, // done
    opacity? : number, // done
    overflowX? : overflow, // done
    overflowY? : overflow, // done
    
    USESHADOW? : boolean, // done
    boxShadows? : boxShadow[], // done
    muxBoxShadClr? : color, // done

    USEBORDER? : boolean,
    borderWidthTop? : unitedAttr<number>, // done
    borderWidthRight? : unitedAttr<number>, // done
    borderWidthBottom? : unitedAttr<number>, // done
    borderWidthLeft? : unitedAttr<number>, // done
    borderColor? : color, // done
    borderStyleTop? : borderOutlineStyle, // done
    borderStyleRight? : borderOutlineStyle, // done
    borderStyleBottom? : borderOutlineStyle, // done
    borderStyleLeft? : borderOutlineStyle, // done
    borderRadiusTop? : unitedAttr<number>, // done
    borderRadiusRight? : unitedAttr<number>, // done
    borderRadiusBottom? : unitedAttr<number>, // done
    borderRadiusLeft? : unitedAttr<number>, // done

    marginTop? : unitedAttr<number>, // done
    marginRight? : unitedAttr<number>, // done
    marginBottom? : unitedAttr<number>, // done
    marginLeft? : unitedAttr<number>, // done

    paddingTop? : unitedAttr<number>, // done
    paddingRight? : unitedAttr<number>, // done
    paddingBottom? : unitedAttr<number>, // done
    paddingLeft? : unitedAttr<number>, // done
    
    height? : unitedAttr<number>, // done
    width? : unitedAttr<number>, // done
    
    // outline radius is controlled by border radius. That's why it doesn't exist here
    // outline also only accept one type of style
    USEOUTLINE? : boolean, // done
    outlineWidth? : unitedAttr<number>, // done
    outlineColor? : color, // done
    outlineStyle? : borderOutlineStyle, // done
    outlineOffset? : unitedAttr<number>, // done

    USETEXT? : boolean, // done
    content? : string, // done
    placeholder? : string, // done
    typeStyle? : typographyStyle, // we have to condense all of these stuff into a single attribute because we have an overlay controlling it. And that requires a single, condensed attr.
    color? : color, // done

    display?: displayTypes,

    // FLEX ONLY (implement in public preview 2.0)
    justifyContent?: flexAlignment, // done, kinda
    alignItems?: flexAlignment, // done, kinda
    flexDirection?: flexDirection, // 2.0

    // translateX? : unitedAttr<number>,
    // translateY? : unitedAttr<number>,
    // scaleX? : number,
    // scaleY? : number,  
};

export let collection = writable<element[]>([]); // the project file data

export let selectedComponent = writable<number>(-1);
export let selectedOverride = writable<number>(-1);
export let focusedComponent = writable<number>(-1); // this is for detecting delete
export let focusedOverride = writable<number>(-1); // this is for detecting delete
export let layerDeleteLock = writable<boolean>(false); // this is for locking the delete function. If this is true, you can't delete
export let layerBlurLock = writable<boolean>(false); // this is for locking the blur function. If this is true, you can't blur

// functions for controlling the collection list
export const addComponent = (type:HTMLtag, defaultStyle:elementStyle={}, showOutline=false) => {
    let currCollection = get(collection);
    // check if type aready exist in currCollection
    for(let i = 0; i < currCollection.length; i++){
        if(currCollection[i].type === type){
            // type already exist. Add new blank override to that type instead
            addOverride(i);
            return;
        }
    }

    // create a new element interfact instance with type *type*, and then set the new value to collection
    currCollection = [...currCollection, {
        type : type,
        showing : false,
        style : defaultStyle,
        styleOverrides : [],
        showOutline : showOutline
    }];
    collection.set(currCollection);
}

export const addOverride = (elmntIndex:number):void => {
    let currCollection = get(collection);

    // find a non-duplicate name
    let i = 1;
    while(true){
        let nameDup = false;
        for(let j = 0; j < currCollection[elmntIndex].styleOverrides.length; j++){
            if(currCollection[elmntIndex].styleOverrides[j].name === `override-${i}`){
                // set nameDup to true and break loop
                nameDup = true;
                break;
            }
        }
        // if there is no dup, break out loop
        if(!nameDup) break;
        i++; // else increment i and check again
    }

    // create a new override and add it to styleOverrides
    const cs = currCollection[elmntIndex].style;
    currCollection[elmntIndex].styleOverrides = [...currCollection[elmntIndex].styleOverrides, {
        name: `override-${i}`,
        // style: Object.assign({}, currCollection[elmntIndex].style)
        style: structuredClone(cs)
    }]

    // show overrides first
    currCollection[elmntIndex].showing = true;
    currCollection = [...currCollection];

    collection.set(currCollection);
}