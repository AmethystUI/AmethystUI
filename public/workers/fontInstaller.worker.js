(function () {
    'use strict';

    /// <reference no-default-lib="true"/>
    self.addEventListener("install", event => {
        const installEvent = event;
        // fetch fileURLs from google font
        console.log("Hi from worker install");
        installEvent.waitUntil(new Promise((res, rej) => {
            // initialize parsed data
            // let parsedData: fontURLs[];
            // make fetch request to google font API to get file URLS and their associated data
            // fetch("https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyDW3JQmec-yJykfP-FcRYpIujOc6jYa4RQ")
            // .then(resp => { 
            //     if(!resp.ok) rej(`Failed to fetch google font list. Response code: ${resp.status}`);
            //     // Parse the response into JSON
            //     resp.json()
            // })
            // .then(data => {
            //     const fontObjs: rawFontObjs = data["items"];
            //     // extract data to parsedData
            //     console.log(fontObjs);
            // })
            res(0);
        }));
    });
    self.addEventListener("activate", event => {
        console.log("Hi from worker activate");
    });
    self.addEventListener('fetch', (event) => {
        console.log('Fetching:', event.request.url);
    });

})();
//# sourceMappingURL=fontInstaller.worker.js.map
