import * as React from "react";
import * as ReactDOM from "react-dom";
import Viewer from "./components/viewer/viewer";
import './main.css';
import { ScrapeData } from "../scraper/merge/merge-dom-styles";

(async function(){
    const embeddedSource = document.getElementById('scraped-data') as HTMLScriptElement;
    let dataPromise: Promise<ScrapeData>;
    if(embeddedSource) {
        dataPromise = Promise.resolve(JSON.parse(embeddedSource.innerText) as ScrapeData);
    } else {
        dataPromise = fetch('/data.json')
            .then(res => res.text())
            .then(res => JSON.parse(res));
    }
    
    const data = await dataPromise
    
    ReactDOM.render(
        <Viewer data={data}></Viewer>,
        document.getElementById('viewer-root')
    );
})();