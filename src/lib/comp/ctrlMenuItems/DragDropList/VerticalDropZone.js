import { Direction } from './types';
export default class VerticalDropZone {
    direction = Direction.Vertical;
    id;
    priority;
    itemSize;
    currentDragEl;
    count;
    el;
    items;
    containerClass;
    constructor(id, count, priority, itemSize) {
        this.id = id;
        this.priority = priority;
        this.count = count;
        this.itemSize = itemSize;
        this.items = new Array(count);
        this.el = undefined;
        this.containerClass = 'vertical';
    }
    pointIndex(x, y) {
        const { el, count, items, currentDragEl } = this;
        const b = el.getBoundingClientRect();
        const top = b.top - el.scrollTop + window.scrollY;
        // const rawOver = Math.floor((y - top) / 20);

        let rawOver = 0; // here we will calculate the drop index
        // let sumHeight = currentDragEl.getBoundingClientRect().height/2;
        let sumHeight = 22.5;
        let i = 0
        // keep adding to rawOver until the sumHeight is above relative y position 
        for(i = 0; i < items.length; i++){
            if(items[i] === null || items[i].id === currentDragEl.id){
                // if ID matches, skip self and add one to check thresh to check 1 further
                continue;
            }

            if(sumHeight < currentDragEl.getBoundingClientRect().y - top){
                rawOver++;
                sumHeight += items[i].getBoundingClientRect().height;
            }
        }
        
        return Math.min(Math.max(rawOver, 0), count);
    }
    placeholderStyleStr() {
        return `height: ${500}px; width: 100%`;
    }
    dragXOffset(index) {
        const b = this.el.getBoundingClientRect();
        return b.left;
    }
    dragYOffset(index) {
        const { items, currentDragEl } = this;
        const b = this.el.getBoundingClientRect();
        // calculate height for all elements above it
        let sumHeight = 0;
        let checkThresh = index;
        for(let i = 0; i < checkThresh; i++){
            if(items[i].id === currentDragEl.id){
                // if ID matches, skip self and add one to check thresh to check 1 further
                checkThresh++;
                continue;
            }
            sumHeight += items[i].getBoundingClientRect().height;
        }
        return sumHeight + b.top;
    }
    itemHeight() {
        return this.itemSize;
    }
    itemWidth() {
        return this.el.clientWidth;
    }
    styleSourceMove(hover, source, transition) {
        const { items, currentDragEl } = this;
        for (let i = 0; i < items.length; ++i) {
            // move element to base
            const base = (hover > source && (i < source || (i > source && i <= hover))) ||
                (hover < source && i < hover) ||
                (hover == source && i < source);
            // move element down
            const raise = (hover > source && i > hover) ||
                (hover < source && ((i >= hover && i < source) || i > source)) ||
                (hover == source && i > source);
            const item = items[i];
            if (base) {
                item &&
                    // (item.style.cssText = `transform: translateY(0px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${itemSize}px;`); SIG CHANGE
                    (item.style.cssText = `transform: translateY(0px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
            }
            else if (raise) {
                if (transition) {
                    item &&
                        (item.style.cssText = `transform: translateY(${currentDragEl.getBoundingClientRect().height}px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
                }
                else {
                    // prevent the transition jump on first render
                    item &&
                        // (item.style.cssText = `transform: translateY(${itemSize}px); height: ${itemSize}px;`);
                        (item.style.cssText = `transform: translateY(${currentDragEl.getBoundingClientRect().height}px); height: ${item.getBoundingClientRect().height}px;`);
                }
            }
        }
    }
    styleSourceMissing(index) {
        const { items } = this;
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            item &&
                i !== index &&
                (items[i].style.cssText = `transform: translateY(0px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${items[i].getBoundingClientRect().height}px;`);
        }
    }
    styleDestMove(index) {
        const { items } = this;
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            if (i < index) {
                item &&
                    (item.style.cssText = `transform: translateY(0px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
            }
            else {
                item &&
                    (item.style.cssText = `transform: translateY(${item.getBoundingClientRect().height}px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
            }
        }
    }
    styleDestReset() {
        const { items } = this;
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            item &&
                (items[i].style.cssText = `transform:translateY(0px); transition:transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
        }
    }
    styleRemove() {
        this.styleContainerBaseStyle();
    }
    styleContainerBaseStyle() {
        const { items } = this;
        for (let i = 0; i < items.length; ++i) {
            const item = items[i];
            // item && (item.style.cssText = `height: ${itemSize}px;`); SIG CHANGE
            item && (item.style.cssText = "");
        }
    }
}
