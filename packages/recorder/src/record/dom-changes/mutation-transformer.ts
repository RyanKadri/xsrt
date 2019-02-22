import { AttributeMutation, ChangeChildrenMutation, ChangeTextMutation, Interface, LoggingService, RecordedMutation } from "@xsrt/common";
import { inject, injectable } from "inversify";
import { shouldTraverseNode } from "../../filter/filter-dom";
import { RecordingDomManager } from "../../traverse/traverse-dom";

@injectable()
export class MutationTransformer {

    constructor(
        @inject(RecordingDomManager) private domWalker: Interface<RecordingDomManager>,
        @inject(LoggingService) private logger: Interface<LoggingService>
    ) {}

    transformMutation(mutation: MutationRecord): RecordedMutation[] {
        const targetEl = this.domWalker.fetchManagedNode(mutation.target, false);
        if (!targetEl) {
            this.logger.info(mutation.target);
            return [];
        }
        const target = targetEl.id;
        if (mutation.type === "attributes") {
            return [ this.attributeMutation(mutation, target) ];
        } else if (mutation.type === "characterData") {
            return [ this.textMutation(mutation, target) ];
        } else {
            const res: RecordedMutation[] = [];
            if (mutation.removedNodes && mutation.removedNodes.length > 0) {
                const removal = this.removeChildrenMutation(mutation, target);
                if (removal) {
                    res.push(removal);
                }
            }
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                res.push(this.addChildrenMutation(mutation, target));
            }
            return res;
        }
    }

    private attributeMutation(mutation: MutationRecord, target: number): AttributeMutation {
        const name = mutation.attributeName!;
        return {
            type: "attribute",
            target,
            attribute: {
                name,
                value: (mutation.target as HTMLElement).getAttribute(name)!
            }
        };
    }

    private textMutation(mutation: MutationRecord, target: number): ChangeTextMutation {
        return {
            type: "change-text",
            target,
            update: mutation.target.textContent || ""
        };
    }

    private removeChildrenMutation(mutation: MutationRecord, target: number): ChangeChildrenMutation | null {
        const removal = {
            type: "children" as "children",
            target,
            removals: Array.from(mutation.removedNodes)
                .filter(shouldTraverseNode)
                .filter(node => this.domWalker.isManaged(node))
                .map(node => this.domWalker.fetchManagedNode(node)!),
            additions: []
        };
        return removal.removals.length > 0 ? removal : null;
    }

    private addChildrenMutation(mutation: MutationRecord, target: number): ChangeChildrenMutation {
        const additions = Array.from(mutation.addedNodes)
            .filter(shouldTraverseNode)
            .map(addition => {
                const processed = this.domWalker.traverseNode(addition)!;
                let before: Node | null | undefined = processed.domElement;
                while (before && !this.domWalker.isManaged(before.nextSibling)) {
                    before = before.nextSibling;
                }

                let beforeId: number | null = null;
                if (before && before.nextSibling) {
                    beforeId = this.domWalker.fetchManagedNode(before.nextSibling).id;
                }
                return {
                    before: beforeId,
                    data: processed
                };
            });
        return {
            type: "children",
            target,
            additions,
            removals: []
        };
    }
}
