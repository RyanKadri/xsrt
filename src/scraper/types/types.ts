import { InitMetadata, RecordingMetadata } from "../traverse/extract-metadata";
import { RecordedMutationGroup } from "../record/dom-changes/mutation-recorder";
import { RecordedUserInput } from "../record/user-input/input-recorder";

export type ScrapedElement = ScrapedHtmlElement | ScrapedTextElement;
export type OptimizedElement = OptimizedHtmlElementInfo | OptimizedTextElementInfo;

export interface ScrapedHtmlElement extends OptimizedHtmlElementInfo {
    domElement: Element;
    attributes: ScrapedAttribute[];
    children: ScrapedElement[];
}

export interface ScrapedTextElement extends OptimizedTextElementInfo {
    domElement?: Element;
}

export interface ScrapedAttribute {
    name: string;
    value: string;
    references?: string[];
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

export interface ScrapedData {
    root: ScrapedHtmlElement;
    metadata: InitMetadata;
    changes: RecordedMutationGroup[];
    inputs: RecordedInputChannels;
}

export interface DedupedData {
    root: OptimizedHtmlElementInfo;
    metadata: RecordingMetadata;
    changes: RecordedMutationGroup[];
    inputs: RecordedInputChannels;
    assets: string[];
}

export type RecordedInputChannels = {
    [channel: string]: RecordedUserInput[];
}

export interface OptimizedStyleRule {
    text: string;
    references?: string[];
}

export interface OptimizedHtmlElementInfo {
    type: 'element';
    id: number;
    value?: string | number;
    tag: string;
    attributes?: ScrapedAttribute[];
    children: OptimizedElement[];
}

export interface OptimizedStyleElement extends OptimizedHtmlElementInfo {
    tag: 'style';
    rules: OptimizedStyleRule[]
}

export interface OptimizedTextElementInfo {
    type: 'text',
    id: number;
    content: string;
}