import { findInTree, transformTree, treeReduce } from "./tree-utils";

describe('tree-utils', () => {
    describe(transformTree.name, () => {
        it('Walks over a tree and transforms nodes', () => {
            const tree: ValNode = {
                val: 1, children: [
                    { val: 2, children: [
                        {val: 3}, {val: 4}
                    ]}
            ]}
            const transformed = transformTree(
                tree,
                (node) => ({ newVal: node.val * 2 }),
                node => node.children
            );
            expect(transformed).toEqual({
                newVal: 2, children: [
                    { newVal: 4, children: [
                        { newVal: 6 }, { newVal: 8 }
                    ]}
                ]
            })
        })
    })

    describe(findInTree.name, () => {
        it('Does a depth first search to find an element in a tree', () => {
            const tree: ValNode = {
                val: 123, children: [
                    { val: 234, children: [
                        { val: 345 }
                    ]}
                ]
            };
            const node = findInTree(tree, (node) => node.val > 300, node => node.children);
            expect(node).toBeDefined()
            expect(node!.val).toEqual(345);
        })

        it('Returns undefined if no element is present', () => {
            const tree: ValNode = {
                val: 123
            };
            const node = findInTree(tree, (node) => node.val > 300, node => node.children);
            expect(node).toBeUndefined()
        })
    })

    describe(treeReduce.name, () => {
        it('Iterates over every node and calls the reducer function', () => {
            const tree: ValNode = {
                val: 1, children: [{ 
                    val: 2, children: [{
                        val: 3
                    }]
                }]
            };
            const sum = treeReduce(tree, (acc, el) => acc + el.val, node => node.children, 0);
            expect(sum).toEqual(6);
        })
    })
})

interface ValNode {
    val: number;
    children?: ValNode[];
}