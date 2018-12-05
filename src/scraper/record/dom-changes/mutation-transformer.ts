import { injectable } from "inversify";
import { RecordingDomManager } from "../../traverse/traverse-dom";
import { RecordedMutation, AttributeMutation, ChangeTextMutation, ChangeChildrenMutation } from "./mutation-recorder";
import { shouldTraverseNode } from "../../filter/filter-dom";

@injectable()
export class MutationTransformer {

    constructor(
        private domWalker: RecordingDomManager,
    ) {}

    transformMutation(mutation: MutationRecord): RecordedMutation[] {
        const target = this.domWalker.fetchManagedNode(mutation.target).id;

        if(mutation.type === 'attributes') {
            return [ this.attributeMutation(mutation, target) ];
        } else if(mutation.type === 'characterData') {
            return [ this.textMutation(mutation, target) ];
        } else {
            const res: RecordedMutation[] = [];
            if(mutation.removedNodes && mutation.removedNodes.length > 0) {
                res.push(this.removeChildrenMutation(mutation, target));
            }
            if(mutation.addedNodes && mutation.addedNodes.length > 0) {
                res.push(this.addChildrenMutation(mutation, target));
            }
            return res;
        }
    }

    private attributeMutation(mutation: MutationRecord, target: number): AttributeMutation {
        return {
            type: 'attribute',
            target,
            name: mutation.attributeName!,
            val: (mutation.target as HTMLElement).getAttribute(name)!
        };
    }

    private textMutation(mutation: MutationRecord, target: number): ChangeTextMutation {
        return {
            type: "change-text",
            target,
            update: mutation.target.textContent || ''
        }
    }

    private removeChildrenMutation(mutation: MutationRecord, target: number): ChangeChildrenMutation {
        return {
            type: "children",
            target,
            removals: Array.from(mutation.removedNodes)
                .map(node => this.domWalker.fetchManagedNode(node)!),
            additions: []
        }
    }

    private addChildrenMutation(mutation: MutationRecord, target: number): ChangeChildrenMutation {
        const additions = Array.from(mutation.addedNodes)
            .filter(shouldTraverseNode)
            .map(addition => {
                const processed = this.domWalker.traverseNode(addition)!;
                let before: Node | null | undefined = processed.domElement;
                while(before && !this.domWalker.isManaged(before.nextSibling)) {
                    before = before.nextSibling;
                }

                let beforeId: number | null = null;
                if(before) {
                    beforeId = this.domWalker.fetchManagedNode(before).id;
                }
                return {
                    before: beforeId,
                    data: processed
                }
            });
        return {
            type: 'children',
            target,
            additions,
            removals: []
        }
    }
}