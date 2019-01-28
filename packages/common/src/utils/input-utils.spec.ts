import { pluck, sortAsc } from "./functional-utils";
import { convertMapToGroups, mergeGroups, mergeMaps } from "./input-utils";

describe(`input-utils`, () => {
    describe(mergeMaps.name, () => {
        it('Merges groups of channeled inputs', () => {
            const a1 = { name: "a1", timestamp: 1 };
            const a2 = { name: "a2", timestamp: 2 };
            const b1 = { name: "b1", timestamp: 1 };
            const b2 = { name: "b2", timestamp: 2 };

            const oldInputs = {
                a: [a1],
                b: [b2]
            }
            const newInputs = {
                a: [a2],
                b: [b1]
            }
            const merged = mergeMaps(oldInputs, newInputs, sortAsc(pluck("timestamp")));
            expect(merged).toEqual({
                a: [a1, a2],
                b: [b1, b2]
            })
        })
    });

    describe(convertMapToGroups.name, () => {
        it(`Converts a dictionary to a set of groups by using the key as the group name`, () => {
            const groups = convertMapToGroups({
                group1: ['a','b', 'c'],
                group2: ['d', 'e', 'f']
            });

            expect(groups.some(group => group.name === 'group1')).toBeTruthy()
            expect(groups.some(group => group.name === 'group2')).toBeTruthy()
        })
    });

    describe(mergeGroups.name, () => {
        it('Merges sets of groups according to group names', () => {
            const groupSet1 = [
                { name: "test", elements: [1]}
            ]

            const groupSet2 = [
                { name: "test2", elements: [1]}
            ]
            const merged = mergeGroups(groupSet1, groupSet2, (a, b) => a - b);
            expect(merged.length).toEqual(2);
            expect(merged.some(group => group.name === 'test'));
            expect(merged.some(group => group.name === 'test2'));
        });

        it(`Merges groups according to a sort order if group names collide`, () => {
            const groupSet1 = [
                { name: "group", elements: [{thing: 1}, {thing: 3}] }
            ];
            const groupSet2 = [
                { name: "group", elements: [{thing: 2}]}
            ]
            const merged = mergeGroups(groupSet1, groupSet2, (a,b) => a.thing - b.thing );
            expect(merged).toEqual([{
                name: 'group',
                elements: [{ thing: 1}, { thing: 2}, { thing: 3}]
            }])
        })
    })

    describe(mergeMaps.name, () => {
        it(`Merges maps`, () => {
            const map1 = {
                test1: ['hello']
            }
            const map2 = {
                test2: ['world']
            }
            const merged = mergeMaps(map1, map2, (a,b) => a.localeCompare(b))
            expect(merged).toEqual({
                test1: ['hello'],
                test2: ['world']
            })
        })
    })

})
