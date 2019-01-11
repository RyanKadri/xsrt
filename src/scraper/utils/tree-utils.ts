
export function transformTree<T, R>(root: T, transformNode: (node: T) => Partial<R> | undefined, fetchChildren: FetchChildrenCallback<T>): R {
    const children = fetchChildren(root);
    const transformedChildren = children !== undefined 
        ? children.map(child => transformTree(child, transformNode, fetchChildren))
        : undefined;
    const currentNode = transformNode(root) as any;
    return {
        ...currentNode,
        ...transformedChildren ? {children: transformedChildren } : {}
    };
}

export function findInTree<T>(root: T, predicate: (node: T) => boolean, fetchChildren: FetchChildrenCallback<T>): T | undefined {
    if (predicate(root)) {
        return root;
    } else {
        const children = fetchChildren(root);
        for (const child of children || []) {
            const res = findInTree(child, predicate, fetchChildren);
            if (res !== undefined) {
                return res;
            }
        }
        return undefined;
    }
}

export function treeReduce<T, R>(root: T, reducer: (acc: R, node: T) => R, fetchChildren: FetchChildrenCallback<T>, init: R) {
    let res = reducer(init, root);
    const children = fetchChildren(root);
    for (const child of children || []) {
        res = treeReduce(child, reducer, fetchChildren, res);
    }
    return res;
}

export function treeForEach<T>(root: T, op: (node: T) => void, fetchChildren: FetchChildrenCallback<T>) {
    op(root);
    (fetchChildren(root) || []).forEach(node => treeForEach(node, op, fetchChildren));
}

type FetchChildrenCallback<T> = (node: T) => (T[] | undefined);
