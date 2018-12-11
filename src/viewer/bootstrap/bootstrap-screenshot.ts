import { DomManager } from "@scraper/playback/dom-manager";
import { DedupedData } from "@scraper/types/types";

(async function() {
    const urlMatch = location.search.match(/recording=([a-zA-Z0-9_\-]+)/); 
    if(urlMatch) {
        const domManager = new DomManager();
        domManager.initialize(document);
        
        const recording = urlMatch[1];
        const data: DedupedData = await fetch(`/api/recordings/${recording}`)
            .then(resp => resp.json())

        await domManager.createInitialDocument(data);
        window['targetViewport'] = {
            height: data.metadata.viewportHeight,
            width: data.metadata.viewportWidth
        }

    }
})()