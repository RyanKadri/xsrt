import { optimizeAttributeMutations } from "./optimize-mutations";
import { AttributeMutation } from "../record/dom-changes/mutation-recorder";

describe('optimizeAttributeMutations', () => {
    it('Consolidates changes to the same attribute on the target', () => {
        const mutations = optimizeAttributeMutations([
            { type: 'attribute', target: 1, name: 'thing', val: 'abc'}, //This should get removed
            { type: 'attribute', target: 1, name: 'thing', val: 'def'},
            { type: 'attribute', target: 1, name: 'thing2', val: '123'},
            { type: 'attribute', target: 2, name: 'thing', val: 'xyz'}
        ], new Set())
        expect(mutations.length).toEqual(3);
        expect((mutations[0] as AttributeMutation).val === 'def');
    });

    it('Excludes attribute changes that will have been synchronously removed in this frame', () => {
        const mutations = optimizeAttributeMutations([
            { type: 'attribute', target: 1, name: 'thing', val: 'abc'},
            { type: 'attribute', target: 2, name: 'thing', val: 'abc'},
            { type: 'attribute', target: 3, name: 'thing', val: 'abc'},
        ], new Set([2,3]));
        expect(mutations.length).toEqual(1);
        expect(mutations[0].target).toEqual(1);
    });
})

describe('Testing framework', () => {
    it('Lets me mess with the DOM', () => {
        const div = document.createElement('div');
        div.textContent = 'Hello World';
        document.body.appendChild(div);
        expect(document.documentElement!.innerText.trim() === 'Hello World');
    })
})