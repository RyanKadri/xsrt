import { ScrapedStyleRule, OptimizedStyleRule } from "../types/types";
import { UrlReferenceMapping } from "../transform/transform-styles";
import { normalizeUrl } from "../utils/utils";

export function dedupeStyles(rules: ScrapedStyleRule[], initAssets: UrlReferenceMapping, idGen: () => number)
    : { styles: OptimizedStyleRule[], assets: UrlReferenceMapping } {
    const assets = extractStyleUrls(rules, initAssets, idGen);
    return { 
        styles: replaceUrlsInRules(rules, assets).map(trimRule),
        assets
    }
}

function trimRule(rule: ScrapedStyleRule): OptimizedStyleRule {
    return {
        text: rule.text,
        references: rule.references && rule.references.length > 0 ? rule.references : undefined
    }
}

function replaceUrlsInRules(rules: ScrapedStyleRule[], assets: UrlReferenceMapping): ScrapedStyleRule[] {
    return rules.map(rule => ({
        ...rule,
        ...replaceUrls(rule, assets)
    })) as ScrapedStyleRule[];
}

function replaceUrls(rule: ScrapedStyleRule, assets: UrlReferenceMapping): Partial<ScrapedStyleRule> {
    return (rule.references || [])
        .reduce((curr, ref, i) => {
            const refNum = assets[normalizeUrl(ref, rule.source)];
            curr.references[i] = '' + refNum
            return {
                text: curr.text.replace(ref, `##${refNum}##`),
                references: curr.references
            }
        }, { text: rule.text, references: rule.references! });
}

function extractStyleUrls(rules: ScrapedStyleRule[], mapping: UrlReferenceMapping, idGen: () => number) {
    const updated = { ...mapping };
    rules.forEach(rule => {
        (rule.references || [])
            .map(ref => normalizeUrl(ref, rule.source))
            .forEach(ref => {
                if(!updated[ref]) {
                    updated[ref] = '' + idGen();
                }
            });
    })
    return updated;
}