import { extractStyleInfo } from "../traverse/traverse-styles";
import { OptimizedStyleElement, OptimizedStyleRule, ScrapedHtmlElement, ScrapedStyleRule, ScrapedTextElement } from "../types/types";
import { matchesMedia } from "../utils/utils";
import { NodeOptimizationResult, OptimizationContext } from "./optimize";

export function optimizeStyle(styleEl: ScrapedHtmlElement, initContext: OptimizationContext): NodeOptimizationResult {
    if(isLinkStylesheet(styleEl) || !shouldIncludeSheet(styleEl)) {
        return inertPlaceholder(styleEl, initContext);
    } else {
        const parsedRules = extractStyleInfo(extractSheet(styleEl));
        const context = extractStyleUrls(parsedRules, initContext);
        return {
            nodeTask: {
                ...styleEl,
                tag: 'style',
                children: stripChildText(styleEl.children as ScrapedTextElement[]),
                rules: replaceUrlsInRules(parsedRules, context).map(trimRule),
            } as OptimizedStyleElement,
            context
        }
    }
    
}

function inertPlaceholder(styleEl: ScrapedHtmlElement, context: OptimizationContext){
    return {
        nodeTask: {
            ...styleEl,
            children: [],
            rules: []
        } as OptimizedStyleElement,
        context
    }
}

function stripChildText(children: ScrapedTextElement[]) {
    if(children.length > 0) {
        children[0].content = '';
    }
    return children;
}

function trimRule(rule: ScrapedStyleRule): OptimizedStyleRule {
    return {
        text: rule.text,
        references: rule.references && rule.references.length > 0 ? rule.references.map(ref => parseInt(ref)) : undefined
    }
}

function replaceUrlsInRules(rules: ScrapedStyleRule[], context: OptimizationContext): ScrapedStyleRule[] {
    return rules.map(rule => ({
        ...rule,
        ...replaceUrls(rule, context)
    })) as ScrapedStyleRule[];
}

function replaceUrls(rule: ScrapedStyleRule, context: OptimizationContext): Partial<ScrapedStyleRule> {
    return (rule.references || [])
        .reduce((curr, ref, i) => {
            const refNum = context.assets.findIndex(asset => asset === normalizeUrl(ref, rule.source));
            curr.references[i] = '' + refNum
            return {
                text: curr.text.replace(ref, `##${refNum}##`),
                references: curr.references
            }
        }, { text: rule.text, references: rule.references! });
}

function extractStyleUrls(rules: ScrapedStyleRule[], context: OptimizationContext) {
    const newContext = [...context.assets];
    rules.forEach(rule => {
        (rule.references || [])
            .map(ref => normalizeUrl(ref, rule.source))
            .forEach(ref => {
                if(!newContext.includes(ref)) {
                    newContext.push(ref);
                }
            });
    })
    return {
        assets: newContext
    };
}

function extractSheet(styleEl: ScrapedHtmlElement) {
    return (styleEl.domElement as HTMLStyleElement).sheet as CSSStyleSheet;
}

function shouldIncludeSheet(styleEl: ScrapedHtmlElement) {
    const sheet = extractSheet(styleEl);
    if(matchesMedia(sheet.media)) {
        try { 
            sheet.rules;
            return sheet.rules.length > 0;
        } catch {
            return false
        }
    } else {
        return false;
    }
}

function isLinkStylesheet(styleEl: ScrapedHtmlElement) {
    return styleEl.tag === 'link' && 
                !styleEl.attributes.some(attr => attr.name === 'rel' && attr.value === 'stylesheet')
}

// TODO - Speaking of normalizing, we should probably normalize relative paths for deduping as well...
export function normalizeUrl(url: string, source?: string) {
    return urlIsAbsolute(url) || source === undefined
        ? url
        : source.replace(/\/[^\/]*?$/, '/' + url);
}

function urlIsAbsolute(url: string) {
    return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')
}
