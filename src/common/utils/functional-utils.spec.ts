import { between, debounce, group, groupToMap, identity, noop, pipe, reverseFind, toKeyValMap } from "./functional-utils";

describe(groupToMap.name, () => {
    it("Groups a set of elements based on a selector function", () => {
        const elements = [1, 2, 3, 4, 5];
        const res = groupToMap(elements, el => el > 3 ? "big" : "small");
        expect(res.get("big")!.length).toBe(2);
        expect(res.get("small")!.length).toBe(3);
        expect(res.get("big")).toContain(4);
    });

    it("Can put the same item into multiple groups if the selector function returns an array", () => {
        const people = [
            { first: "Bob", last: "Jones" },
            { first: "Bob", last: "Smith" },
            { first: "Alice", last: "Jones" }
        ];
        const res = groupToMap(people, person => [ person.first, person.last ]);
        expect(res.get("Jones")!.length).toBe(2);
        expect(res.get("Bob")).toContain(people[1]);
    });
});

describe(reverseFind.name, () => {
    it("Returns the first element that matches the predicate (searching in reverse)", () => {
        const things = ["test123", "something", "else", "test456"];
        const res = reverseFind(things, (thing) => thing.startsWith("test"));
        expect(res).toBe("test456");
    });

    it("Returns undefined if the element does not exist", () => {
        const res = reverseFind([1, 2, 3], el => el > 100);
        expect(res).toBeUndefined();
    });
});

describe(debounce.name, () => {
    it(`Splits a single array into an array of arrays where each element is less than 'debounce' steps from its neighbors`, () => {
        const elements = [1, 3, 7, 13, 14, 21];
        const debounced = debounce(elements, 5, (el) => el);
        expect(debounced).toEqual([[1, 3, 7], [13, 14], [21]]);
    });

    it("Returns an empty array when nothing is passed in", () => {
        expect(debounce([], 0, identity)).toEqual([]);
    });
});

describe(between.name, () => {
    it("Is inclusive on both sides", () => {
        expect(between(1, 1, 2)).toBeTruthy();
        expect(between(2, 1, 3)).toBeTruthy();
        expect(between(5, 1, 2)).toBeFalsy();
    });
});

describe(pipe.name, () => {
    it("Applies functions in left to right order", () => {
        const add10 = (a: number) => a + 10;
        const mult3 = (a: number) => a * 3;
        expect(pipe(add10, mult3)(1)).toBe(33);
    });
});

describe(group.name, () => {
    it("Groups elements into an array of group objects based on a group selector function", () => {
        const elements = [{ amount: 5 }, { amount: 6 }, { amount: 101 }];
        const groups = group(elements, (el) => el.amount > 50 ? "big" : "small");
        const sortedByGroup = groups.sort((a, b) => a.group.localeCompare(b.group));
        expect(sortedByGroup).toEqual([
            { group: "big", items: [{ amount: 101 }]},
            { group: "small", items: [{amount: 5}, {amount: 6}]}
        ]);
    });
});

describe(toKeyValMap.name, () => {
    it("Groups items into an object literal (dictionary) based on key and val selector functions", () => {
        const elements = [{ id: "123", name: "Bob"}, {id: "234", name: "Jones" }];
        const dictionary = toKeyValMap(elements, el => el.id, el => el.name);
        expect(dictionary).toEqual({ 123: "Bob", 234: "Jones" });
    });
});

describe(identity.name, () => {
    it("Returns itself (convenience fn)", () => {
        expect(identity(1)).toBe(1);
    });
});

describe(noop.name, () => {
    it("Does nothing (I guess this is kind of dumb to test)", () => {
        expect(noop()).toBeUndefined();
    })
})
