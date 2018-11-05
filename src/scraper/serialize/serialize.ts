import { ScrapedHtmlElement, ScrapedElement } from "../types/types";

const emptyElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

export function serialize(root: ScrapedHtmlElement, docType: string) {
    return `<!doctype ${docType}>
${_serialize(root)}`

}

function _serialize(node: ScrapedElement): string {
    if(node.type === 'text') {
        return node.content;
    } else {
        if(emptyElements.has(node.tag)) {
            return `<${node.tag} ${serializeAttrs(node)}>`
        } else {
            return `<${node.tag} ${serializeAttrs(node)}>${node.children.map(child => _serialize(child)).join('')}</${node.tag}>`;
        }
    }
}

function serializeAttrs(node: ScrapedHtmlElement) {
    return node.attributes.map(attr => `${attr.name}="${attr.value}"`).join(' ');
}