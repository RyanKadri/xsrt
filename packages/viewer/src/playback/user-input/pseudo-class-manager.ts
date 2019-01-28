import { CSS_PSEUDO_CLASSES, PseudoClassReplacer } from "@xsrt/common";
import { injectable } from "inversify";
import { DomManager } from "../dom-manager";

/* This class applies state-based pseudo classes to the dom based on
 */
@injectable()
export class PseudoClassManager {

    private classTracker = new Map<string, Set<HTMLElement>>();

    constructor(
        private domManager: DomManager
    ) {
        Object.values(CSS_PSEUDO_CLASSES).forEach(pseudo => {
            this.classTracker.set(pseudo.replacementClass, new Set());
        });
    }

    hoverTarget(target: number) {
        this.applyPseudoClass(CSS_PSEUDO_CLASSES.hover, target, true);
    }

    markActive(target: number) {
        this.applyPseudoClass(CSS_PSEUDO_CLASSES.active, target, false);
    }

    removeActive() {
        this.removePseudoClass(CSS_PSEUDO_CLASSES.active);
    }

    removeFocus() {
        this.removePseudoClass(CSS_PSEUDO_CLASSES.focus);
        this.removePseudoClass(CSS_PSEUDO_CLASSES.focusWithin);
    }

    applyFocus(target: number) {
        this.applyPseudoClass(CSS_PSEUDO_CLASSES.focus, target, false);
        this.applyPseudoClass(CSS_PSEUDO_CLASSES.focusWithin, target, true, true);
    }

    private removePseudoClass(pseudoClass: PseudoClassReplacer) {
        const applicableElements = this.classTracker.get(pseudoClass.replacementClass)!;
        applicableElements.forEach(el => {
            el.classList.remove(pseudoClass.replacementClass);
        });
    }

    // I remove with a diff here because removing all classes and re-adding (even synchronously)
    // seems to hurt performance
    private applyPseudoClass(pseudoClass: PseudoClassReplacer, target: number, propogateUp = false, skipBase = false) {
        const clss = pseudoClass.replacementClass;
        const toRemove = new Set(this.classTracker.get(clss) || []);
        const applied = new Set();

        this.domManager.mutateElement(target, (node) => {
            let curr: HTMLElement = node;
            do {
                if (!skipBase) {
                    curr.classList.add(clss);
                    applied.add(curr);
                    toRemove.delete(curr);
                } else {
                    skipBase = false;
                }
                curr = curr.parentElement!;
            } while (curr && propogateUp);

            toRemove.forEach((oldElement) => oldElement.classList.remove(clss));
            this.classTracker.set(clss, applied);
        });
    }
}
