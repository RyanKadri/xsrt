import { matchesMedia, recoverGlobals } from "../utils/utils";

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