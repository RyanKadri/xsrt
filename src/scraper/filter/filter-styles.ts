import { matchesMedia, recoverGlobals } from "../utils/utils";

export function shouldIncludeSheet(sheet: CSSStyleSheet) {
    if(matchesMedia(sheet.media)) {
        try { 
            sheet.rules;
            return true;
        } catch {
            return false
        }
    } else {
        return false;
    }
}

export function shouldIncludeRule(rule: CSSRule): boolean {
    const globals = recoverGlobals();
    if(rule instanceof CSSMediaRule) {
        return matchesMedia(rule.media);
    } else if(rule instanceof CSSSupportsRule) {
        return globals['CSS'].supports(rule.conditionText);
    } else {
        return true;
    }
}