import { DedupedData } from "@scraper/types/types";
import { DomManager } from "@scraper/playback/dom-manager";

(async function() {
    const urlMatch = location.search.match(/recording=(\w+)/);
    if(urlMatch) {
        const frame = document.querySelector('#target-iframe') as HTMLIFrameElement;
        const domManager = new DomManager();
        domManager.initialize(frame.contentDocument as Document);
        
        const recording = urlMatch[1];
        const data: DedupedData = await fetch(`/api/recordings/${recording}`)
            .then(resp => resp.json())
        domManager.serializeToDocument(data);

        window['targetViewport'] = {
            height: data.metadata.viewportHeight,
            width: data.metadata.viewportWidth
        }
    }
})()