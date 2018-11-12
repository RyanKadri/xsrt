import { ScrapedAttribute, DedupedData, OptimizedElement, OptimizedStyleRule, OptimizedHtmlElementInfo } from "../types/types";
import { toBlobUrl } from "../utils/utils";

export async function serializeToDocument(data: DedupedData, document: Document): Promise<Map<number, Node>> {
    const nodeMapping = new Map<number, Node>();

    const assets = await adjustReferences(data.assets);
    
    const docType = `<!DOCTYPE ${ data.metadata.docType }>`
    document.write(docType + '\n<html></html>');
    
    document.removeChild(document.documentElement!);
    serializeToElement(document, data.root, nodeMapping, assets);
    
    const styles = serializeStyles(data.styles, assets);
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;

    document.head!.appendChild(styleElement);

    return nodeMapping;
}

export function serializeToElement(parent: Node, node: OptimizedElement, nodeMapping: Map<number, Node>, assets: string[], currNS = '', before: number | null = null) {
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

function createElement(node: OptimizedHtmlElementInfo, nodeMapping: Map<number, Node>, assets: string[], currNS = '') {
    const attributes = node.attributes || [];
    const nsAttr = (attributes).find(attr => attr.name === 'xmlns');
    const ns = nsAttr ? nsAttr.value : currNS;
    let created = ns ? document.createElementNS(ns, node.tag): document.createElement(node.tag) as Element;
    
    attributes.forEach(attr => setAttribute(created, attr, assets));
    if(node.children) {
        node.children.forEach(child => serializeToElement(created, child, nodeMapping, assets, ns))
    }
    if(node.value && 'value' in created) {
        (created as HTMLInputElement).value = '' + node.value;
    }
    return created;
}

function serializeStyles(styles: OptimizedStyleRule[], assets: string[]) {
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