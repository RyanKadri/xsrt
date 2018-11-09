import { ScrapedStyleRule, ScrapedElement } from "../types/types";
import * as template from '../../viewer/index.html';
import { ScrapedData, DedupedData } from "../scrape";
import { toBlobUrl, toJson } from "../utils/utils";

export function serializeToViewer(data: ScrapedData) {
    return (template as any).replace(
        '<!-- EMBEDDED_DATA_PLACEHOLDER -->',
        `<script id="scraped-data" type="application/json">${ toJson(data) }</script>`);
}

export async function serializeToDocument(data: DedupedData, document: Document): Promise<void> {
    const assets = await adjustReferences(data.assets);
    const styles = serializeStyles(data.styles, assets);
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;

    const rootElement = document.documentElement as HTMLElement;
    rootElement.removeChild(document.body as HTMLBodyElement);
    rootElement.removeChild(document.head as HTMLHeadElement);
    _serializeInto(rootElement, data.root.children);
    data.root.attributes.forEach(attr => rootElement.setAttribute(attr.name, attr.value))
    const head = document.head as HTMLHeadElement;
    head.appendChild(styleElement);

    function _serializeInto(parent: Element, elements: ScrapedElement[], currNS = '') {
        const domNodes = elements.map(node => {
            if(node.type === 'element') {
                let curr: Element;
                const nsAttr = node.attributes.find(attr => attr.name === 'xmlns');
                const ns = nsAttr ? nsAttr.value : currNS;
                if(ns) {
                    curr = document.createElementNS(ns, node.tag)
                } else {
                    curr = document.createElement(node.tag);
                }
                node.attributes.forEach(attr => curr.setAttribute(attr.name, attr.value));
                if(node.children) {
                    _serializeInto(curr, node.children, ns);
                }
                if(node.value && 'value' in curr) {
                    (curr as HTMLInputElement).value = '' + node.value;
                }
                return curr;
            } else {
                return document.createTextNode(node.content);
            }
        })
        domNodes.forEach(node => parent.appendChild(node));
    }
}

function serializeStyles(styles: ScrapedStyleRule[], assets: string[]) {
    return styles.map(style => {
        if(!style.references) {
            return style.text;
        } else {
            let rule = style.text;
            style.references.forEach(ref => {
                rule = rule.replace(`##${ref}##`, assets[ref]);
            })
            return rule;
        }
    }).join('');
}

async function adjustReferences(refs: string[]) {
    return Promise.all(
        refs.map(toBlobUrl)
    );
}