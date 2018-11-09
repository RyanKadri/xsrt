import * as React from "react";
import * as ReactDOM from "react-dom";
import Viewer from "./components/viewer/viewer";
import './main.css';
import { DedupedData } from "../scraper/scrape";

(async function(){
    const data = await fetchRecordingData();
    
    ReactDOM.render(
        <Viewer data={data}></Viewer>,
        document.getElementById('viewer-root')
    );

    async function fetchRecordingData() {
        const embeddedSource = document.getElementById('scraped-data') as HTMLScriptElement;
        if(embeddedSource) {
            return JSON.parse(embeddedSource.innerText) as DedupedData;
        } else {
            return fetch('/data.json')
                .then(res => res.text())
                .then(res => JSON.parse(res));
        }
    }
})();