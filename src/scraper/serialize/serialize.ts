import { ScrapedStyleRule, ScrapedElement, ScrapedHtmlElement, ScrapedAttribute } from "../types/types";
import * as template from '../../viewer/index.html';
import { ScrapedData, DedupedData } from "../scrape";
import { toBlobUrl, toJson } from "../utils/utils";

export function serializeToViewer(data: ScrapedData) {
    return (template as any).replace(
        '<!-- EMBEDDED_DATA_PLACEHOLDER -->',
        `<script id="scraped-data" type="application/json">${ toJson(data) }</script>`);
}

export async function serializeToDocument(data: DedupedData, document: Document): Promise<Map<number, Node>> {
    const nodeMapping = new Map<number, Node>();

    const assets = await adjustReferences(data.assets);
    const styles = serializeStyles(data.styles, assets);
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;

    document.removeChild(document.documentElement!);
    serializeToElement(document, data.root, nodeMapping, assets);
    const head = document.head as HTMLHeadElement;
    head.appendChild(styleElement);

    return nodeMapping;

}

export function serializeToElement(parent: Node, node: ScrapedElement, nodeMapping: Map<number, Node>, assets: string[], currNS = '', before: number | null = null) {
    const created = node.type === 'element'
        ? createElement(node, nodeMapping, assets, currNS)
        : document.createTextNode(node.content);
    created['debug-scrape-data'] = node;
    nodeMapping.set(node.id, created);
    if(before) {
        if(nodeMapping.has(before)) {
            parent.insertBefore(created, nodeMapping.get(before)!)
        }
    } else {
        parent.appendChild(created);
    }
}

function createElement(node: ScrapedHtmlElement, nodeMapping: Map<number, Node>, assets: string[], currNS = '') {
    const nsAttr = node.attributes.find(attr => attr.name === 'xmlns');
    const ns = nsAttr ? nsAttr.value : currNS;
    let created = ns ? document.createElementNS(ns, node.tag): document.createElement(node.tag) as Element;
    
    node.attributes.forEach(attr => setAttribute(created, attr, assets));
    if(node.children) {
        node.children.forEach(child => serializeToElement(created, child, nodeMapping, assets, ns))
    }
    if(node.value && 'value' in created) {
        (created as HTMLInputElement).value = '' + node.value;
    }
    return created;
}

function serializeStyles(styles: ScrapedStyleRule[], assets: string[]) {
    return styles.map(style => {
        if(!style.references) {
            return style.text;
        } else {
            return replaceReferences(style.text, style.references, assets);
        }
    }).join('');
}

function setAttribute(node: Element, attr: ScrapedAttribute, assets: string[]) {
    let val: string;
    if(attr.references) {
        val = replaceReferences(attr.value, attr.references, assets);
    } else {
        val = attr.value;
    }
    node.setAttribute(attr.name, val);
}

function replaceReferences(valWithRefs: string, references: string[], assets: string[]) {        
    references.forEach(ref => {
        valWithRefs = valWithRefs.replace(`##${ref}##`, assets[ref]);
    })
    return valWithRefs;
}

async function adjustReferences(refs: string[]) {
    return Promise.all(
        refs.map(toBlobUrl)
    );
}