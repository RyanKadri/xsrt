import { OptimizedStyleRule, ScrapedHtmlElement, ScrapedStyleRule, ScrapedTextElement, ScrapedAttribute, OptimizedHtmlElementInfo, OptimizedStyleElement, formatAssetRef } from "@xsrt/common";
import { extractStyleInfo } from "../traverse/traverse-styles";
import { matchesMedia } from "../utils/dom-utils";
import { OptimizationContext } from "./optimization-context";
import { extractUrls } from "../transform/transform-styles";

export function optimizeStyle(styleEl: ScrapedHtmlElement, context: OptimizationContext): OptimizedHtmlElementInfo {
    if (isLinkStylesheet(styleEl) || !shouldIncludeSheet(styleEl)) {
        return inertPlaceholder(styleEl, context);
    } else {
        const parsedRules = extractStyleInfo(extractSheet(styleEl));
        return {
            ...styleEl,
            tag: "style",
            children: stripChildText(styleEl.children as ScrapedTextElement[]),
            rules: replaceUrlsInRules(parsedRules, context).map(trimRule),
        } as OptimizedStyleElement;
    }

}

function inertPlaceholder(styleEl: ScrapedHtmlElement, context: OptimizationContext) {
    return {
        ...styleEl,
        attributes: replaceSrc(styleEl, context),
        children: [],
        rules: []
    };
}

function replaceSrc(el: ScrapedHtmlElement, context: OptimizationContext): ScrapedAttribute[] {
    if (el.tag === "link" && el.attributes.some(attr => attr.name === "rel" && attr.value === "stylesheet")) {
        return el.attributes.map(attr => {
            if (attr.name === "href") {
                const id = context.registerAsset(attr.value); // This is not function. Feel free to rewrite.
                return { name: attr.name, value: formatAssetRef(id), references: [id] };
            } else {
                return attr;
            }
        });
    } else {
        return el.attributes;
    }
}

function stripChildText(children: ScrapedTextElement[]) {
    if (children.length > 0) {
        children[0].content = "";
    }
    return children;
}

function trimRule(rule: OptimizedStyleRule): OptimizedStyleRule {
    return {
        text: rule.text,
        references: rule.references && rule.references.length > 0
            ? rule.references
            : undefined
    };
}

function replaceUrlsInRules(rules: ScrapedStyleRule[], context: OptimizationContext): OptimizedStyleRule[] {
    return rules.map(rule => replaceUrls(rule, context));
}

function replaceUrls(rule: ScrapedStyleRule, context: OptimizationContext): OptimizedStyleRule {
    const urls = extractUrls(rule.text);
    let text = rule.text;
    const references: number[] = [];
    for (const url of urls) {
        const absUrl = toAbsoluteUrl(url, rule.source);
        const id = context.registerAsset(absUrl);
        text = text.replace(url, formatAssetRef(id));
        references.push(id);
    }
    return { text, references };
}

function extractSheet(styleEl: ScrapedHtmlElement) {
    return (styleEl.domElement as HTMLStyleElement).sheet as CSSStyleSheet;
}

function shouldIncludeSheet(styleEl: ScrapedHtmlElement) {
    const sheet = extractSheet(styleEl);
    if (matchesMedia(sheet.media)) {
        try {
            // This line should throw if the sheet is cross-site
            return sheet.rules.length > 0;
        } catch {
            return false;
        }
    } else {
        return false;
    }
}

function isLinkStylesheet(styleEl: ScrapedHtmlElement) {
    return styleEl.tag === "link" &&
                !styleEl.attributes.some(attr => attr.name === "rel" && attr.value === "stylesheet");
}

// TODO - Speaking of normalizing, we should probably normalize relative paths for deduping as well...
function toAbsoluteUrl(url: string, source?: string) {
    return urlIsAbsolute(url) || source === undefined
        ? url
        : source.replace(/\/[^\/]*?$/, "/" + url);
}

function urlIsAbsolute(url: string) {
    return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}
