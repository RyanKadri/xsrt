export function transformTree<T, R>(root: T, transformNode: (node: T) => R, fetchChildren: FetchChildrenCallback<T>): R {
    const children = fetchChildren(root);
    const transformedChildren = children ? children.map(child => transformTree(child, transformNode, fetchChildren)): undefined;
    const currentNode = transformNode(root) as any;
    return {
        ...currentNode,
        children: transformedChildren
    }
}

export function findInTree<T>(root: T, predicate: (node: T) => boolean, fetchChildren: FetchChildrenCallback<T>): T | undefined {
    if(predicate(root)) {
        return root;
    } else {
        const children = fetchChildren(root);
        for(const child of children || []) {
            const res = findInTree(child, predicate, fetchChildren);
            if(res !== undefined) {
                return res;
            }
        }
        return undefined;
    }
}

type FetchChildrenCallback<T> = (node: T) => T[] | undefined