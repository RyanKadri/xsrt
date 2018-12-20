import { MapTo, StripArray } from "./type-utils";

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

export const between = (from: number, to: number) => (num: number) => num >= from && num <= to;
export const pluck = <T = any, K extends keyof T = any>(key: K) => (item: T) => item[key]; 
export const pipe = <A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C) => (a1: A) => {
    return fn2(fn1(a1));
}

export const nCopies = <T>(item: T, n: number) => new Array(n).fill(item);

export const sortAsc = <T = any>(fieldAccessor: ((inp: T) => number)) => (a: T, b: T) => {
    return fieldAccessor(a) - fieldAccessor(b);
}

export const debounce = <T>(elements: T[], debounceTime: number, timeFetcher: (el: T) => number): T[][] => {
    if(elements.length === 0) return [];

    const elementGroups: T[][] = [];
    let lastTime = timeFetcher(elements[0]);
    let currGroup: T[] = [];
    for(const el of elements) {
        const currTime = timeFetcher(el);
        if(currTime - lastTime < debounceTime) {
            currGroup.push(el);
        } else {
            elementGroups.push(currGroup);
            currGroup = [el];
        }
        lastTime = currTime;
    }
    elementGroups.push(currGroup)

    return elementGroups;
}

export function toKeyValMap<T, R>(arr: T[], keyFn: (el: T) => string, valFn: (el: T) => R): MapTo<R> {
    return arr.reduce((acc, el) => {
        acc[keyFn(el)] = valFn(el);
        return acc;
    }, {} as MapTo<R>)
}