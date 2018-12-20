import { debounce, groupToMap, reverseFind } from "./functional-utils";

describe('groupToMap', () => {
    it('Groups a set of elements based on a selector function', () => {
        const elements = [1,2,3,4,5];
        const res = groupToMap(elements, el => el > 3 ? 'big' : 'small');
        expect(res.get('big')!.length).toBe(2);
        expect(res.get('small')!.length).toBe(3);
        expect(res.get('big')).toContain(4)
    });

    it('Can put the same item into multiple groups if the selector function returns an array', () => {
        const people = [
            { first: 'Bob', last: 'Jones' },
            { first: 'Bob', last: 'Smith' },
            { first: 'Alice', last: 'Jones' }
        ];
        const res = groupToMap(people, person => [ person.first, person.last ]);
        expect(res.get('Jones')!.length).toBe(2);
        expect(res.get('Bob')).toContain(people[1]);
    })
});

describe('reverseFind', () => {
    it('Returns the first element that matches the predicate (searching in reverse)', () => {
        const things = ["test123", "something", "else", "test456"];
        const res = reverseFind(things, (thing) => thing.startsWith("test"));
        expect(res).toBe("test456");
    });

    it('Returns undefined if the element does not exist', () => {
        const res = reverseFind([1,2,3], el => el > 100);
        expect(res).toBeUndefined()
    })
})

describe(debounce.name, () => {
    it(`Splits a single array into an array of arrays where each element is less than 'debounce' steps from its neighbors`, () => {
        const elements = [1, 3, 7, 13, 14, 21];
        const debounced = debounce(elements, 5, (el) => el);
        expect(debounced).toEqual([[1, 3, 7], [13, 14], [21]])
    })
})