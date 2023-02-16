export {};

// import type { fontObject } from "./fonts";

// export class fontPreviewLoader {
//     private queue: fontObject[] = []; // the list of fonts that should be loaded
//     private executing = false;

//     loadPreview(fontObj: fontObject) {
//         this.queue.push(fontObj); // add to query
//         this.processQueue(); // execute all pending requests
//     }

//     private async processQueue() {
//         if (this.executing || this.queue.length === 0) { // do not reexecute if query is already executing
//             return;
//         }

//         this.executing = true;
//         const index = this.queue.shift();

//         // Load the font data for the given index
//         await loadFont(index);

//         this.executing = false;
//         this.processQueue();
//     }
// }
