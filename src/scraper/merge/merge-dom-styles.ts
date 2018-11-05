import { ScrapedHtmlElement } from "../types/types";

export function merge(root: ScrapedHtmlElement, styles: string) {
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
    return root;
}