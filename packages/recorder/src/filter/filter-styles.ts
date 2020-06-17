import { matchesMedia, recoverGlobals } from "../utils/dom-utils";

export function shouldIncludeRule(rule: CSSRule): boolean {
  CSS
    const globals = recoverGlobals() as Window & { CSS: typeof CSS };
    if (rule instanceof CSSMediaRule) {
        return matchesMedia(rule.media);
    } else if (rule instanceof CSSSupportsRule) {
        return (globals.CSS).supports(rule.conditionText);
    } else {
        return true;
    }
}
