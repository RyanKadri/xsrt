export interface PseudoClassReplacer { checker: RegExp; replacementClass: string; }

export const CSS_PSEUDO_CLASSES = {
    hover: { checker: /:hover/g, replacementClass: "__hover"},
    active: { checker: /:active/g, replacementClass: "__active" },
    focus: { checker: /:focus/g, replacementClass: "__focus" },
    focusWithin: { checker: /:focus-within/g, replacementClass: "__focus-within" }
};
