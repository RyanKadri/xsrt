import { DomManager } from "@scraper/playback/dom-manager";
import { Recording, SnapshotChunk } from "../../scraper/types/types";

(async function() {
    const urlMatch = location.search.match(/recording=([a-zA-Z0-9_\-]+)/); 
    if(urlMatch) {
        const domManager = new DomManager();
        domManager.initialize(document);
        
        const recording = urlMatch[1];
        const data: Recording = await fetch(`/api/recordings/${recording}`)
            .then(resp => resp.json());
        const chunkId = data.chunks.sort((a, b) => a.metadata.startTime - b.metadata.startTime)[0]._id;
        const initChunk: SnapshotChunk = await fetch(`/api/chunks/${chunkId}`).then(resp => resp.json())

        await domManager.createInitialDocument(initChunk);
        const { viewportHeight, viewportWidth } = initChunk.snapshot.documentMetadata
        window['targetViewport'] = {
            height: viewportHeight,
            width: viewportWidth
        }

    }
})()