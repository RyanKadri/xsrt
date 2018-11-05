import { extractDom } from "./scraper/traverse/traverse-dom";
import { extractStyles } from "./scraper/traverse/traverse-styles";
import { transformDom } from "./scraper/transform/transform-dom";
import { triggerDownload } from "./scraper/utils/utils";
import { merge } from "./scraper/merge/merge-dom-styles";
import { serialize } from "./scraper/serialize/serialize";
import { Globals } from './overrides';

(window as Globals).scraper = {/*  */
    async scrape(config: ScraperConfig) {
        const docType = (document.doctype && document.doctype.name) || 'html';
        const root = extractDom(document.documentElement as HTMLElement);
        const [cleanDom] = await transformDom(root);
        const styles = await extractStyles(Array.from(document.styleSheets) as CSSStyleSheet[]);
        const merged = merge(cleanDom, styles);
        if(config.output === 'single-page') {
            const serialized = serialize(cleanDom, docType);
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