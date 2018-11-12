import * as React from "react";
import * as ReactDOM from "react-dom";
import Viewer from "./components/viewer/viewer";
import './main.css';
import pako from "pako";
import { DedupedData } from "../scraper/types/types";

(async function(){
    const data = await fetchRecordingData();
    
    ReactDOM.render(
        <Viewer data={data}></Viewer>,
        document.getElementById('viewer-root')
    );

    //TODO - This whole deflation part should be handled by native browser stuff on the receiving end.
    async function fetchRecordingData() {
        const embeddedSource = document.getElementById('scraped-data') as HTMLScriptElement;
        if(embeddedSource) {
            return JSON.parse(embeddedSource.innerText) as DedupedData;
        } else {
            const data = await fetch('/data.json');
            try {
                const text = await (await data.clone()).text();
                return JSON.parse(text)
            } catch(e) {
                const bin = new Uint8Array(await data.arrayBuffer());
                const inflated = pako.inflate(bin, { to: 'string' });
                return JSON.parse(JSON.parse(inflated)); //Because parsing once is for Loooosers
            }
        }
    }
})();