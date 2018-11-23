import { ScrapedStyleRule } from "../types/types";

export function transformRule(rule: ScrapedStyleRule): ScrapedStyleRule {
    return { ...rule, references: extractUrls(rule), text: transformContent(rule) }
}

function transformContent(rule: ScrapedStyleRule) {
    return replacePseudoClasses(rule)
}

export type PseudoClassReplacer = { checker: RegExp, replacementClass: string};

export const CSS_PSEUDO_CLASSES = {
    hover: { checker: /:hover/g, replacementClass: "__hover"},
    active: { checker: /:active/g, replacementClass: "__active" }, 
    focus: { checker: /:focus/g, replacementClass: "__focus" }, 
    focusWithin: { checker: /:focus-within/g, replacementClass: "__focus-within" }
}
function replacePseudoClasses(rule: ScrapedStyleRule) {
    return Object.values(CSS_PSEUDO_CLASSES).reduce((finalText, currentReplacement) => {
        if(rule.type !== 'style' || !currentReplacement.checker.test(rule.selector)) {
            return finalText;
        } else {
            return rule.text.replace(currentReplacement.checker, '.' + currentReplacement.replacementClass);
        }
    }, rule.text);
}

const outerUrlRegex = /url\(['"].*?['"]\)/ig;
const innerUrlRegex = /\(['"](.*?)['"]\)/;
function extractUrls(rule: ScrapedStyleRule) {
    return (rule.text.match(outerUrlRegex) || [])
            .map(extractInner)
            .filter(urlIsRemote)
}

//TODO - In the same vein, we should probably handle blobs.
function urlIsRemote(url: string) {
    return !url.startsWith('data:');
}

function extractInner(fullUrl: string) {
    return fullUrl.match(innerUrlRegex)![1];
}

export type UrlReferenceMapping = {
    [url: string]: string;
}

export interface StyleDeduplicationResult { 
    rules: ScrapedStyleRule[], 
    assets: UrlReferenceMapping
}