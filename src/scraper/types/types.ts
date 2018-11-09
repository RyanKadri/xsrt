export type ScrapedElement = ScrapedHtmlElement | ScrapedTextElement;

export interface ScrapedHtmlElement {
    type: 'element';
    id: number;
    domElement: Element;
    value?: string | number;
    tag: string;
    attributes: ScrapedAttribute[];
    children: ScrapedElement[];
}

export interface ScrapedAttribute {
    name: string;
    value: string;
}

export interface ScrapedTextElement {
    type: 'text',
    id: number;
    content: string;
    domElement: Element;
}

export type ScrapedStyleRule = ScrapedMediaRule | ScrapedFontFaceRule | ScrapedSupportsRule | BasicRule | ImportRule;

export interface ScrapedMediaRule extends BaseScrapedRule {
    conditions: string[];
    type: 'media';
}

export interface ScrapedFontFaceRule extends BaseScrapedRule {
    src: string;
    type: 'font-face';
}

export interface ScrapedSupportsRule extends BaseScrapedRule {
    condition: string;
    type: 'supports';
}

export interface ImportRule extends BaseScrapedRule {
    conditions: string[];
    src: string;
    type: 'import';
}

export interface BasicRule extends BaseScrapedRule {
    type: 'style' | 'keyframe';
}

interface BaseScrapedRule {
    text: string;
    source?: string;
    references?: string[];
}