import { injectable } from "inversify";
import { noop } from "../../../common/utils/functional-utils";
import { AddDescriptor, AttributeMutation, ChangeChildrenMutation, ChangeTextMutation, OptimizedMutation, RecordedMutation, ScrapedElement } from "../../types/types";

@injectable()
export class MutationOptimizer {

    optimizeMutationGroup(mutationGroup: RecordedMutation[]): OptimizedMutation[] {
        const { children, attributes, text } = this.groupChanges(mutationGroup);
        const { children: optChildren, removed } = this.optimizeChildMutations(children);
        return [
            ...optChildren,
            ...this.optimizeAttributeMutations(attributes, removed),
            ...this.optimizeTextMutations(text, removed)
        ].map(this.trimMutation);
    }

    private trimMutation(mutation: RecordedMutation): OptimizedMutation {
        switch (mutation.type) {
            case "attribute":
            case "change-text":
                return mutation;
            case "children":
                return {
                    ...mutation,
                    additions: mutation.additions.length > 0 ? mutation.additions : undefined,
                    removals: mutation.removals.length > 0 ? mutation.removals.map(el => el.id) : undefined
                };
        }
    }

    private groupChanges(changes: RecordedMutation[]) {
        return {
            children: changes.filter(change => change.type === "children") as ChangeChildrenMutation[],
            attributes: changes.filter(change => change.type === "attribute") as AttributeMutation[],
            text: changes.filter(change => change.type === "change-text") as ChangeTextMutation[]
        };
    }

    optimizeAttributeMutations(attributeMutations: AttributeMutation[], removed: Set<number>): AttributeMutation[] {
        const attributeMap = new Map<AttributeMutationHash, AttributeMutation>();
        for (const mut of attributeMutations) {
            if (!removed.has(mut.target)) {
                attributeMap.set(this.hashAttribute(mut), mut);
            }
        }
        return Array.from(attributeMap.values());
    }

    private hashAttribute(attributeMutation: AttributeMutation) {
        return `${attributeMutation.target}:${attributeMutation.name}`;
    }

    optimizeTextMutations(textMutations: ChangeTextMutation[], removed: Set<number>): ChangeTextMutation[] {
        const textMap = new Map<number, ChangeTextMutation>();
        for (const mut of textMutations) {
            if (!removed.has(mut.target)) {
                textMap.set(mut.target, mut);
            }
        }
        return Array.from(textMap.values());
    }

    // TODO - There might still be an issue in here with reporting net removals to attribute
    // and changetext optimizations. For instance, does
    // [add] -> [change-text] -> [remove]
    // get properly optimized to a no-op?
    optimizeChildMutations(childMutations: ChangeChildrenMutation[]) {
        const allAdded = new Set<number>();
        const allRemoved = new Set<number>();
        const topLevelAdditions = new Map<number, AddDescriptor[]>();
        const removalMap = new Map<number, ScrapedElement[]>();
        for (const mutation of childMutations) {
            for (const addition of mutation.additions) {
                if (!allAdded.has(addition.data.id) && !allRemoved.has(addition.data.id)) {
                    const newAdditions = (topLevelAdditions.get(mutation.target) || []).concat(addition);
                    topLevelAdditions.set(mutation.target, newAdditions);
                }
                markDescendants(addition.data, (add) => {
                    allAdded.add(add.id);
                    allRemoved.delete(add.id);
                    if (removalMap.has(add.id)) {
                        removalMap.delete(add.id);
                    }
                });
            }
            for (const removal of mutation.removals) {
                if (!allAdded.has(removal.id)) {
                    removalMap.set(mutation.target, (removalMap.get(mutation.target) || []).concat(removal));
                }
                markDescendants(removal, (remove) => {
                    allRemoved.add(remove.id);
                    allAdded.delete(remove.id);
                    if (topLevelAdditions.has(remove.id)) {
                        topLevelAdditions.delete(remove.id);
                    }
                });
            }
            if (mutation.removals.length > 0 && topLevelAdditions.has(mutation.target)) {
                const oldAdditions = topLevelAdditions.get(mutation.target)!;
                const removals = new Set(mutation.removals.map(remove => remove.id));
                topLevelAdditions.set(mutation.target,
                    oldAdditions.filter(add => !removals.has(add.data.id))
                );
            }
        }

        return {
            children: [
                ...this.reformAdditions(topLevelAdditions),
                ...this.reformRemovals(removalMap)
            ] as ChangeChildrenMutation[],
            removed: allRemoved
        };

        function markDescendants(node: ScrapedElement, cb: (el: ScrapedElement) => void = noop) {
            cb(node);
            if (node.type === "element") {
                node.children.forEach(child => markDescendants(child, cb));
            }
        }

    }

    private reformAdditions(topLevelAdditions: Map<number, AddDescriptor[]>): ChangeChildrenMutation[] {
        return Array.from(topLevelAdditions.entries()).map(([target, additions]) => {
            return {
                type: "children" as "children",
                target,
                removals: [],
                additions
            };
        }).filter(add => add.additions.length > 0);
    }

    private reformRemovals(removalMap: Map<number, ScrapedElement[]>): ChangeChildrenMutation[] {
        return Array.from(removalMap.entries()).map(([target, removals]) => {
            return {
                type: "children" as "children",
                target,
                removals,
                additions: []
            };
        });
    }

}

type AttributeMutationHash = string;
