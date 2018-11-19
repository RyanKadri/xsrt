import { ScrapedStyleRule } from "../types/types";
import { hoverReplacementClass } from "../playback/user-input/mouse-input-player";

export function transformRule(rule: ScrapedStyleRule): ScrapedStyleRule {
    return { ...rule, references: extractUrls(rule), text: transformContent(rule) }
}

function transformContent(rule: ScrapedStyleRule) {
    if(rule.type !== 'style' || !/:hover/.test(rule.selector)) {
        return rule.text;
    } else {
        return rule.text.replace(/:hover/g, '.' + hoverReplacementClass);
    }
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