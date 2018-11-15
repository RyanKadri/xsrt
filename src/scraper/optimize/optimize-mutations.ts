import { RecordedMutation, AttributeMutation, ChangeTextMutation, ChangeChildrenMutation } from "../record/dom-changes/mutation-recorder";
import { ScrapedElement, ScrapedHtmlElement } from "../types/types";

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
    const topLevelAdditions = new Map<number, ChangeChildrenMutation>();
    const topLevelRemovals = new Map<number, ChangeChildrenMutation>();
    const availableNodes = new Map<number, ScrapedHtmlElement>();
    const currentlyRemoved = new Set<number>();

    for(const mutation of childMutations) {
        const target = availableNodes.get(mutation.target);
        if(mutation.additions && mutation.additions.length > 0) {
            if(target) {
                for(const addition of mutation.additions) {
                    if(addition.before) {
                        target.children = [
                            ...target.children.slice(0, addition.before),
                            addition.data,
                            ...target.children.slice(addition.before)
                        ];
                    } else {
                        target.children.push(addition.data);
                    }
                }
            } else {
                if(topLevelRemovals.has(mutation.target)) {
                    const top = topLevelRemovals.get(mutation.target)!;
                    top.removals = top.removals.filter(removal => mutation.additions.some(add => add.data.id === removal))
                }
                if(topLevelAdditions.has(mutation.target)) {
                    const top = topLevelAdditions.get(mutation.target)!;
                    top.additions.push(...mutation.additions);
                } else {
                    topLevelAdditions.set(mutation.target, mutation);
                }
            }
            mutation.additions.forEach(add => {
                currentlyRemoved.delete(add.data.id);
                addSubtree(add.data);
            })
        }
        if(mutation.removals && mutation.removals.length > 0) {
            if(target) {
                const removals = new Set(mutation.removals);
                target.children = target.children.filter(child => !removals.has(child.id));
            } else {
                if(topLevelAdditions.has(mutation.target)) {
                    const top = topLevelAdditions.get(mutation.target)!;
                    top.additions = top.additions.filter(add => !mutation.removals.includes(add.data.id))
                }
                if(topLevelRemovals.has(mutation.target)) {
                    const top = topLevelRemovals.get(mutation.target)!
                    mutation.removals.forEach(removal => {
                        if(!top.removals.includes(removal)) {
                            top.removals.push(removal);
                        }
                    })
                } else {
                    topLevelRemovals.set(mutation.target, mutation);
                }
            }
            mutation.removals.forEach(remove => {
                if(availableNodes.has(remove)) {
                    clearSubtree(availableNodes.get(remove)!)
                }
            })
        }

    }
    
    return  {
        children: [
            ...topLevelAdditions.values(),
            ...topLevelRemovals.values()
        ].filter(change => change.additions.length > 0 || change.removals.length > 0),
        removed: currentlyRemoved
    }

    function addSubtree(subTree: ScrapedElement) {
        if(subTree.type === 'element') {
            currentlyRemoved.delete(subTree.id);
            availableNodes.set(subTree.id, {...subTree});
            subTree.children.forEach(addSubtree);
        }
    }
    
    function clearSubtree(subTree: ScrapedElement) {
        if(subTree.type === 'element') {
            currentlyRemoved.add(subTree.id);
            availableNodes.delete(subTree.id);
            subTree.children.forEach(clearSubtree);
        }
    }
}


type AttributeMutationHash = string;