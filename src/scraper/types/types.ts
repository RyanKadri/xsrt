export type ScrapedElement = ScrapedHtmlElement | ScrapedTextElement;

export interface ScrapedHtmlElement {
    type: 'element';
    el?: HTMLElement;
    tag: string;
    attributes: ScrapedAttribute[];
    children: ScrapedElement[];
}

export interface ScrapedTextElement {
    type: 'text',
    el?: Element;
    content: string;
}

export interface ScrapedAttribute {
    name: string;
    value: string;
}