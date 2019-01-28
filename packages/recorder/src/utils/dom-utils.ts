export function toDataUrl(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
    });
}

export function matchesMedia(media: MediaList | string[]) {
    if (!media || media.length === 0 || (media.length === 1 && !media[0])) { return true; }
    let conditions: string[];
    if (media instanceof MediaList) {
        conditions = Array.from(media);
    } else {
        conditions = media;
    }
    return conditions.some(condition => window.matchMedia(condition).matches);
}

// Leaving this on the page intentionally. You seem to lose some window globals when you remove it.
export const recoverGlobals = (() => {
    let globals: Window;
    let iframe: HTMLIFrameElement;
    return () => {
        if (!globals) {
            iframe = document.createElement("iframe");
            document.body.appendChild(iframe);
            globals = iframe.contentWindow as Window;
            iframe.style.display = "none";
        }
        return globals;
    };
})();

// At least one site I've seen overwrites JSON (cough cough Facebook). Why????
export function toJson(data: any) {
    const globals = recoverGlobals() as Window & { JSON: JSON };
    return globals.JSON.stringify(data, (key, val) => key === "domElement" ? undefined : val);
}

export const hideNodeAttr = "screen-scrape-ignore";
export function nodeIsHidden(node: Node) {
    return isElementNode(node)
        ? node.hasAttribute(hideNodeAttr)
        : false;
}

export function isElementNode(node: Node): node is HTMLElement {
    return node.nodeType === document.ELEMENT_NODE;
}

export function isTextNode(node: Node): node is Element {
    return node.nodeType === document.TEXT_NODE;
}
