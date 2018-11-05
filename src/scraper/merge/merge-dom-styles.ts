import { ScrapedHtmlElement } from "../types/types";
import { ScrapeMetadata } from "../traverse/extract-metadata";

export function merge(root: ScrapedHtmlElement, styles: string, metadata: ScrapeMetadata): ScrapeData {
    const head = root.children.find(el => el.type === 'element' && el.tag === 'head') as ScrapedHtmlElement;
    if(head === undefined) throw new Error('Cannot find head tag');
    head.children.push({ 
        type: 'element',
        tag: 'style',
        attributes: [],
        children: [
            {
                type: 'text',
                content: styles
            }
        ]
    })
    return { root, metadata };
}

export interface ScrapeData {
    root: ScrapedHtmlElement;
    metadata: ScrapeMetadata;
}