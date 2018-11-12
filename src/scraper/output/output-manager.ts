import * as template from '../../viewer/index.html';
import { ScrapedData } from "../scrape";
import { toJson } from '../utils/utils';

export function serializeToViewer(data: ScrapedData) {
    return (template as any).replace(
        '<!-- EMBEDDED_DATA_PLACEHOLDER -->',
        `<script id="scraped-data" type="application/json">${ toJson(data) }</script>`);
}