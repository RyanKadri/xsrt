import { CSS_PSEUDO_CLASSES, ScrapedStyleRule } from "@xsrt/common";

export function transformRule(rule: ScrapedStyleRule): ScrapedStyleRule {
    return { ...rule, references: extractUrls(rule.text), text: transformContent(rule) };
}

function transformContent(rule: ScrapedStyleRule) {
    return replacePseudoClasses(rule);
}

function replacePseudoClasses(rule: ScrapedStyleRule) {
    return Object.values(CSS_PSEUDO_CLASSES).reduce((finalText, currentReplacement) => {
        if (rule.type !== "style" || !currentReplacement.checker.test(rule.selector)) {
            return finalText;
        } else {
            return finalText.replace(currentReplacement.checker, "." + currentReplacement.replacementClass);
        }
    }, rule.text);
}

const outerUrlRegex = /url\(['"].*?['"]\)/ig;
const innerUrlRegex = /\(['"](.*?)['"]\)/;
export function extractUrls(ruleBody: string) {
    return (ruleBody.match(outerUrlRegex) || [])
            .map(extractInner)
            .filter(urlIsRemote);
}

// TODO - In the same vein, we should probably handle blobs.
function urlIsRemote(url: string) {
    return !url.startsWith("data:");
}

function extractInner(fullUrl: string) {
    return fullUrl.match(innerUrlRegex)![1];
}

export interface UrlReferenceMapping {
    [url: string]: string;
}

export interface StyleDeduplicationResult {
    rules: ScrapedStyleRule[];
    assets: UrlReferenceMapping;
}
