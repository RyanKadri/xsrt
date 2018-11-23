export function toDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
    })
}

export async function toBlobUrl(dataUrl: string) {
    try {
        const blob = await (await fetch(dataUrl)).blob();
        return URL.createObjectURL(blob);
    } catch(e) {
        return dataUrl;
    }
}

export function matchesMedia(media: MediaList | string[]) {
    if(!media || media.length === 0 || (media.length === 1 && !media[0])) return true;
    let conditions: string[];
    if(media instanceof MediaList) {
        conditions = Array.from(media);
    } else {
        conditions = media;
    }
    return conditions.some(condition => window.matchMedia(condition).matches);
}

export function invert(mapping: StringDict): StringDict {
    const res: StringDict = {};
    for(const key of Object.keys(mapping)) {
        res[mapping[key]] = key;
    }
    return res;
}

//Leaving this on the page intentionally. You seem to lose some window globals when you remove it.
export const recoverGlobals = (function() {
    let globals: Window;
    let iframe: HTMLIFrameElement;
    return function() {
        if(!globals) {
            iframe = document.createElement('iframe');
            document.body.appendChild(iframe);
            globals = iframe.contentWindow as Window;
            iframe.style.display = 'none';
        }
        return globals;
    }
})()

// At least one site I've seen overwrites JSON (cough cough Facebook). Why????
export function toJson(data: any) {
    return recoverGlobals()['JSON'].stringify(data, (key, val) => key === 'domElement' ? undefined : val);
}

export function nodeIsHidden(node: Node) {
    return isElementNode(node) 
        ? node.hasAttribute('screen-scrape-ignore')
        : false;
}

export function isElementNode(node: Node): node is HTMLElement {
    return node.nodeType === document.ELEMENT_NODE;
}

export function isTextNode(node: Node): node is Element {
    return node.nodeType === document.TEXT_NODE
}

export type StripArray<T> = T extends Array<any> ? T[0] : T;

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

type StringDict = {[ key: string]: string };