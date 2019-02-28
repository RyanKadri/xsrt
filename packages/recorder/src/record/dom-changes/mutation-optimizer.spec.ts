import { AttributeMutation, ChangeChildrenMutation, ScrapedElement, ScrapedHtmlElement, ScrapedTextElement } from "@xsrt/common";
import { MutationOptimizer } from "./mutation-optimizer";

describe('MutationOptimzer', () => {

    const optimizer = new MutationOptimizer();
    const attrType: "attribute" = "attribute";

    describe('optimizeAttributeMutations', () => {
        it('Consolidates changes to the same attribute on the target', () => {
            const mutations = optimizer.optimizeAttributeMutations([
                { type: attrType, target: 1, attribute: { name: 'thing', value: 'abc' } }, //This should get removed
                { type: attrType, target: 1, attribute: { name: 'thing', value: 'def'} },
                { type: attrType, target: 1, attribute: { name: 'thing2', value: '123'} },
                { type: attrType, target: 2, attribute: { name: 'thing', value: 'xyz'} }
            ], new Set())
            expect(mutations.length).toEqual(3);
            expect((mutations[0] as AttributeMutation).attribute.value === 'def');
        });

        it('Excludes attribute changes that will have been synchronously removed in this frame', () => {
            const mutations = optimizer.optimizeAttributeMutations([
                { type: attrType, target: 1, attribute: { name: 'thing', value: 'abc'} },
                { type: attrType, target: 2, attribute: { name: 'thing', value: 'abc'} },
                { type: attrType, target: 3, attribute: { name: 'thing', value: 'abc'} },
            ], new Set([2,3]));
            expect(mutations.length).toEqual(1);
            expect(mutations[0].target).toEqual(1);
        });
    });

    describe(`optimizeTextMutations`, () => {
        it(`Consolidates text changes to a given target within a synchronous mutation group`, () => {
            const mutations = optimizer.optimizeTextMutations([
                { type: 'change-text', target: 1, update: 'asd' },
                { type: 'change-text', target: 1, update: 'update' },
                { type: 'change-text', target: 2, update: 'asd' }
            ], new Set());
            expect(mutations.length).toEqual(2);
            expect(mutations[0].update).toEqual('update');
        }),

        it(`Excludes text changes that have been removed in this group`, () => {
            const mutations = optimizer.optimizeTextMutations([
                { type: 'change-text', target: 1, update: 'asd' },
                { type: 'change-text', target: 2, update: 'asd' },
                { type: 'change-text', target: 3, update: 'asd' },
            ], new Set([1, 2]))
            expect(mutations.length).toEqual(1);
            expect(mutations[0].target).toEqual(3);
        })
    })

    describe(`optimizeChildMutations`, () => {

        it(`Returns unrelated additions and removals without modification`, () => {
            const { children } = optimizer.optimizeChildMutations([
                addition(12, textNode(13)),
                addition(14, textNode(15)),
                removal(16, [17])
            ])
            expect(children.length).toEqual(3);
        })

        it(`Merges additions when the target is a child of a previous addition`, () => {
            const { children } = optimizer.optimizeChildMutations([
                addition(12, elementNode(13, [textNode(14), textNode(15)])),
                addition(13, textNode(14)),
                addition(13, textNode(15))
            ])
            /*
                ____BEFORE____               ____AFTER____
                mutate - addition            mutate - addition
                    12 -> div (13)              12 -> div (13)
                mutate - addition                   text (14)
                    13 -> text (14)                 text (15)
                mutate - addition
                    13 -> text (15)
            */
            expect(children.length).toEqual(1);
            expect(children[0].additions.length).toEqual(1);
            const createdEl = children[0].additions[0].data as ScrapedHtmlElement;
            expect(createdEl.children.length).toEqual(2);
        })

        it(`Cancels additions and removals on the top level`, () => {
            const { children } = optimizer.optimizeChildMutations([
                addition(12, elementNode(13)),
                removal(12, [13])
            ]);
            expect(children.length).toEqual(0);
        })

        it(`Cancels additions and removals on children`, () => {
            const { children } = optimizer.optimizeChildMutations([
                addition(12, elementNode(13,
                    [ textNode(14), textNode(15) ]
                )),
                removal(13, [14])
            ])
            expect(children.length).toEqual(1);
            expect(children[0].additions.length).toEqual(1);
            expect(children[0].removals.length).toEqual(0);
        });

        it(`Returns net-removed children`, () => {
            const { removed } = optimizer.optimizeChildMutations([
                addition(12, textNode(13)),
                removal(12, [13]),
                removal(17, [18, 19])
            ]);
            expect(removed.size).toEqual(3);
        })

        it(`Makes sure not to insert duplicates (because MutationRecords are mutable)`, () => {
            const { children } = optimizer.optimizeChildMutations([
                addition(12, elementNode(13,
                    [textNode(14), textNode(15)]
                )),
                addition(13, textNode(14), textNode(15)),
            ]);
            expect(children.length).toEqual(1);
            const el = children[0].additions[0].data as ScrapedHtmlElement;
            expect(el.children.length).toEqual(2);
        })

        function addition(target: number, ...additions: ScrapedElement[]): ChangeChildrenMutation {
            return {
                type: 'children',
                target,
                removals: [],
                additions: additions.map(add => ({before: null, data: add}))
            };
        }

        function removal(target: number, removals: number[]): ChangeChildrenMutation {
            return {
                type: 'children',
                target,
                additions: [],
                removals: removals.map(id => elementNode(id))
            };
        }

        function textNode(id: number, content = 'test'): ScrapedTextElement{
            return { id, type: 'text', content }
        }

        function elementNode(id: number, children: ScrapedElement[] = []): ScrapedHtmlElement {
            return { id, type: 'element', attributes: [], children, tag: 'div', domElement: undefined as any }
        }
    })
})
