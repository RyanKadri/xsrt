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

export function nodeIsHidden(node: HTMLElement) {
    return node.hasAttribute('screen-scrape-ignore');
}

export function isElementNode(node: Node): node is HTMLElement {
    return node.nodeType === document.ELEMENT_NODE;
}

export function isTextNode(node: Node): node is Element {
    return node.nodeType === document.TEXT_NODE
}

// TODO - Speaking of normalizing, we should probably normalize relative paths for deduping as well...
export function normalizeUrl(url: string, source?: string) {
    return urlIsAbsolute(url) || source === undefined
        ? url
        : source.replace(/\/[^\/]*?$/, '/' + url);
}

function urlIsAbsolute(url) {
    return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')
}

type StringDict = {[ key: string]: string };