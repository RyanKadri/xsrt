import { matchesMedia } from "../utils/utils";
import { ScrapedStyleRule } from "../types/types";
import { shouldIncludeRule } from "../filter/filter-styles";
import { transformRule } from "../transform/transform-styles";

export function extractStyleInfo(styleSheet: CSSStyleSheet): ScrapedStyleRule[] {
    return extractRules(styleSheet)
                .map(transformRule)
}

function extractRules(styleSheet: CSSStyleSheet): ScrapedStyleRule[] {
    return rulesPerSheet(styleSheet)
        .flat(Infinity);
}

function rulesPerSheet(sheet: CSSStyleSheet) {
    return Array.from(sheet.rules)
        .filter(shouldIncludeRule)
        .map(rule => rule instanceof CSSImportRule ? unpackImport(rule) : extractRule(rule, sheet))
}

function unpackImport(rule: CSSImportRule) {
    return matchesMedia(rule.media) ? extractStyleInfo(rule.styleSheet) : [];
}

function extractRule(rule: CSSRule, sheet: CSSStyleSheet): ScrapedStyleRule {
    return { 
        text: rule.cssText,
        source: sheet.href,
        ...extractExtras(rule)
    } as ScrapedStyleRule;
}

function extractExtras(rule: CSSRule) {
    if(rule instanceof CSSStyleRule) {
        return { type: 'style' };
    } else if(rule instanceof CSSKeyframeRule || rule instanceof CSSKeyframesRule) {
        return { type: 'keyframe' };
    } else if(rule instanceof CSSMediaRule) {
        return { type: 'media', conditions: Array.from(rule.media) };
    } else if(rule instanceof CSSSupportsRule) {
        return { type: 'supports', condition: rule.conditionText };
    } else if(rule instanceof CSSFontFaceRule) {
        return { type: 'font-face', src: rule.style['src'] }
    } else if(rule instanceof CSSImportRule) {
        return { type: 'import', src: rule.href }
    } else {
        throw new Error('Unsure how to handle rule: ' + rule.cssText);
    }
}