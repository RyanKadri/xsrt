import { RecordedMutation, AttributeMutation, ChangeTextMutation, ChangeChildrenMutation, AddDescriptor } from "../record/dom-changes/mutation-recorder";
import { ScrapedElement } from "../types/types";

export function optimizeMutationGroup(mutationGroup: RecordedMutation[]): RecordedMutation[] {
    const { children, attributes, text } = groupChanges(mutationGroup);
    const { children: optChildren, removed } = optimizeChildMutations(children);
    return [
        ...optChildren,
        ...optimizeAttributeMutations(attributes, removed),
        ...optimizeTextMutations(text, removed)
    ];
}

function groupChanges(changes: RecordedMutation[]) {
    return {
        children: changes.filter(change => change.type === 'children') as ChangeChildrenMutation[],
        attributes: changes.filter(change => change.type === 'attribute') as AttributeMutation[],
        text: changes.filter(change => change.type === 'change-text') as ChangeTextMutation[]
    }
}

export function optimizeAttributeMutations(attributeMutations: AttributeMutation[], removed: Set<number>): AttributeMutation[] {
    const attributeMap = new Map<AttributeMutationHash, AttributeMutation>();
    for(const mut of attributeMutations) {
        if(!removed.has(mut.target)) {
            attributeMap.set(hashAttribute(mut), mut);
        }
    }
    return Array.from(attributeMap.values());
}

function hashAttribute(attributeMutation: AttributeMutation) {
    return `${attributeMutation.target}:${attributeMutation.name}`;
}

export function optimizeTextMutations(textMutations: ChangeTextMutation[], removed: Set<number>): ChangeTextMutation[] {
    const textMap = new Map<number, ChangeTextMutation>();
    for(const mut of textMutations) {
        if(!removed.has(mut.target)) {
            textMap.set(mut.target, mut);
        }
    }
    return Array.from(textMap.values());
}

export function optimizeChildMutations(childMutations: ChangeChildrenMutation[]) {
    const touched = new Set<number>();
    const topLevelAdditions = new Map<number, AddDescriptor[]>();
    const removals = new Map<number, ScrapedElement[]>();
    for(const mutation of childMutations) {
        for(const addition of mutation.additions) {
            if(!touched.has(addition.data.id)) {
                topLevelAdditions.set(mutation.target, (topLevelAdditions.get(mutation.target) || []).concat(addition));
            }
            markDescendants(addition.data)
        }
        for(const removal of mutation.removals) {
            if(!touched.has(removal.id)) {
                removals.set(mutation.target, (removals.get(mutation.target) || []).concat(removal))
            }
            markDescendants(removal, (remove) => {
                if(topLevelAdditions.has(remove.id)) {
                    topLevelAdditions.delete(remove.id);
                }
            });
        }
        if(mutation.removals.length > 0 && topLevelAdditions.has(mutation.target)) {
            const oldAdditions = topLevelAdditions.get(mutation.target)!;
            const removals = new Set(mutation.removals.map(remove => remove.id));
            topLevelAdditions.set(mutation.target,
                oldAdditions.filter(add => !removals.has(add.data.id))
            );
        } 
    }

    return {
        children: [...reformAdditions(topLevelAdditions), ...reformRemovals(removals)] as ChangeChildrenMutation[],
        removed: touchedNotAdded()
    }

    function markDescendants(node: ScrapedElement, cb: (el: ScrapedElement) => void = () => {}) {
        touched.add(node.id);
        cb(node);
        if(node.type === 'element') {
            node.children.forEach(node => markDescendants(node, cb));
        }    
    }

    function touchedNotAdded() {
        for(const group of topLevelAdditions.values()) {
            group.map(item => item.data).forEach(walk);
        }
        function walk(element: ScrapedElement) {
            touched.delete(element.id)
            if(element.type === 'element') {
                element.children.forEach(walk)
            }
        }
        return touched;
    }

}

function reformAdditions(topLevelAdditions: Map<number, AddDescriptor[]>): ChangeChildrenMutation[] {
    return Array.from(topLevelAdditions.entries()).map(([target, additions]) => {
        return {
            type: 'children' as 'children',
            target,
            removals: [],
            additions
        }
    }).filter(add => add.additions.length > 0)
}

function reformRemovals(removalMap: Map<number, ScrapedElement[]>): ChangeChildrenMutation[] {
    return Array.from(removalMap.entries()).map(([target, removals]) => {
        return {
            type: 'children' as 'children',
            target,
            removals,
            additions: []
        }
    })
}

type AttributeMutationHash = string;