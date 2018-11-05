import { ScrapedHtmlElement, ScrapedElement } from "../types/types";
import * as template from '../../viewer/index.html';
import { ScrapeData } from "../merge/merge-dom-styles";

const emptyElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

export function serializeToViewer(root: ScrapeData) {
    return (template as any).replace(
        '<!-- EMBEDDED_DATA_PLACEHOLDER -->',
        `<script id="scraped-data" type="application/json">${ JSON.stringify(root) }</script>`);
}

export function serializeToDocument(node: ScrapedElement): string {
    if(node.type === 'text') {
        return node.content;
    } else {
        if(emptyElements.has(node.tag)) {
            return `<${node.tag} ${serializeAttrs(node)}>`
        } else {
            return `<${node.tag} ${serializeAttrs(node)}>
${node.children ? node.children.map(child => serializeToDocument(child)).join(''): ''}
</${node.tag}>`;
        }
    }
}

function serializeAttrs(node: ScrapedHtmlElement) {
    return node.attributes.map(attr => `${attr.name}="${attr.value}"`).join(' ');
}