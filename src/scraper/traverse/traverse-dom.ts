import { ScrapedElement } from "../types/types";
import { escapeHtml } from "../utils/utils";

export function extractDom(node: Node): ScrapedElement {
    if(isElementNode(node)) {
        return {
            type: 'element',
            el: node,
            tag: node.tagName.toLowerCase(),
            attributes: Array.from(node.attributes).map(attr => ({ name: attr.name, value: attr.value })),
            children: Array.from(node.childNodes)
                .filter(node => 
                    (node.nodeType === document.ELEMENT_NODE) || 
                    (node.nodeType === document.TEXT_NODE && node.textContent !== '')
                ).map(extractDom)
        };
    } else if(isTextNode(node)) {
        return {
            el: node,
            type: 'text',
            content: escapeHtml(node.textContent || '')
        }
    } else {
        throw new Error('Unsure how to handle node type: ' + node.nodeType);
    }

    function isElementNode(node: Node): node is HTMLElement {
        return node.nodeType === document.ELEMENT_NODE;
    }

    function isTextNode(node: Node): node is Element {
        return node.nodeType === document.TEXT_NODE
    }
}