import { ScrapedStyleRule, OptimizedStyleRule, ScrapedHtmlElement, ScrapedTextElement, OptimizedStyleElement } from "../types/types";
import { normalizeUrl } from "../utils/utils";
import { OptimizationContext, NodeOptimizationResult } from "./optimize";
import { extractStyleInfo } from "../traverse/traverse-styles";
import { shouldIncludeSheet } from "../filter/filter-styles";

export function optimizeStyle(styleEl: ScrapedHtmlElement, initContext: OptimizationContext): NodeOptimizationResult {
    if(styleEl.tag === 'link' && 
        !styleEl.attributes.some(attr => attr.name === 'rel' && attr.value === 'stylesheet')) {
            return inertPlaceholder(styleEl, initContext);
        }
    const sheet = (styleEl.domElement as HTMLStyleElement).sheet as CSSStyleSheet;

    let parsedRules: ScrapedStyleRule[] = [], context = initContext;
    if(shouldIncludeSheet(sheet)) {
        parsedRules = extractStyleInfo(sheet);
        context = extractStyleUrls(parsedRules, initContext);
        return {
            nodeTask: {
                ...styleEl,
                tag: 'style',
                children: stripChildText(styleEl.children as ScrapedTextElement[]),
                rules: replaceUrlsInRules(parsedRules, context).map(trimRule),
            } as OptimizedStyleElement,
            context
        }
    } else {
        return inertPlaceholder(styleEl, initContext);
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
        references: rule.references && rule.references.length > 0 ? rule.references : undefined
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