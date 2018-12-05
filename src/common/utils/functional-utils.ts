import { StripArray } from "./type-utils";

export function groupToMap<T, S>(elements: T[], groupSelector: (el: T) => S) {
    const groups = new Map<StripArray<S>, T[]>();
    for(const el of elements) {
        const grouping = groupSelector(el);
        const groupingArray = Array.isArray(grouping) ? grouping as S[] : [grouping]
        groupingArray.forEach(group => {
            const currGroup = groups.get(group as any) || [];
            groups.set(group as any, currGroup.concat(el));
        })
    }
    return groups;
}

export function group<T, S>(elements: T[], groupSelector: (el: T) => S): { group: StripArray<S>, items: T[] }[] {
    return Array.from(groupToMap(elements, groupSelector).entries())
        .map(([group, items]) => ({ group, items }));
}

export function reverseFind<T>(arr: T[], pred: (item: T) => boolean) {
    for(let i = arr.length - 1; i >= 0; i--) {
        const item = arr[i];
        if(pred(item)) {
            return item;
        }
    }
    return undefined;
}

export const between = (from: number, to: number) => (num) => num > from && num <= to;
export const pluck = <T = any, K extends keyof T = any>(key: K) => (item: T) => item[key]; 
export const pipe = <A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C) => (a1: A) => {
    return fn2(fn1(a1));
}

export const nCopies = <T>(item: T, n) => new Array(n).fill(item);