import { extractDom } from "./traverse/traverse-dom";
import { extractStyles } from "./traverse/traverse-styles";
import { transformDom } from "./transform/transform-dom";
import { triggerDownload } from "./utils/utils";
import { merge } from "./merge/merge-dom-styles";
import { serializeToViewer } from "./serialize/serialize";
import { Globals } from '../overrides';
import { extractMetadata } from "./traverse/extract-metadata";

(window as Globals).scraper = {/*  */
    async scrape(config: ScraperConfig) {
        const metadata = extractMetadata(document, location);
        const root = extractDom(document.documentElement as HTMLElement);
        const [cleanDom] = await transformDom(root);
        const styles = await extractStyles(Array.from(document.styleSheets) as CSSStyleSheet[]);
        const merged = merge(cleanDom, styles, metadata);
        if(config.output === 'single-page') {
            const serialized = serializeToViewer(merged);
            triggerDownload(serialized, 'text/html; charset=UTF-8', 'snapshot.html');
        } else {
            const serialized = JSON.stringify(merged);
            triggerDownload(serialized, 'application/json; charset=UTF-8', 'start-snapshot.json');
        }
    }
}

export interface ScraperConfig {
    output: 'single-page' | 'json';
} 

export interface Scraper {
    scrape(config: ScraperConfig): void;
}