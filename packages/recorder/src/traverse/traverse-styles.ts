import { ScrapedStyleRule } from "@xsrt/common";
import { shouldIncludeRule } from "../filter/filter-styles";
import { transformRule } from "../transform/transform-styles";
import { matchesMedia } from "../utils/dom-utils";

export function extractStyleInfo(styleSheet: CSSStyleSheet): ScrapedStyleRule[] {
    return extractRules(styleSheet)
                .map(transformRule);
}

function extractRules(styleSheet: CSSStyleSheet): ScrapedStyleRule[] {
    return rulesPerSheet(styleSheet)
        .flat(Infinity);
}

function rulesPerSheet(sheet: CSSStyleSheet) {
    return Array.from(sheet.rules)
        .filter(shouldIncludeRule)
        .map(rule => rule instanceof CSSImportRule ? unpackImport(rule) : extractRule(rule, sheet));
}

function unpackImport(rule: CSSImportRule) {
    return matchesMedia(rule.media) ? extractStyleInfo(rule.styleSheet) : [];
}

function extractRule(rule: CSSRule, sheet: CSSStyleSheet): ScrapedStyleRule | ScrapedStyleRule[] {
    if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
        return Array.from(rule.cssRules).map(innerRule => extractRule(innerRule, sheet)).flat(1);
    } else {
        return {
            text: rule.cssText,
            source: sheet.href || undefined,
            ...extractExtras(rule)
        } as ScrapedStyleRule;
    }
}

function extractExtras(rule: CSSRule) {
    if (rule instanceof CSSStyleRule) {
        return { type: "style", selector: rule.selectorText };
    } else if (rule instanceof CSSKeyframeRule || rule instanceof CSSKeyframesRule) {
        return { type: "keyframe" };
    } else if (rule instanceof CSSFontFaceRule) {
        return { type: "font-face", src: (rule.style as CSSStyleDeclaration & { src: string }).src };
    } else if (rule instanceof CSSImportRule) {
        return { type: "import", src: rule.href };
    } else {
        throw new Error("Unsure how to handle rule: " + rule.cssText);
    }
}
