import { ScrapedAttribute, ScrapedElement, ScrapedHtmlElement } from "../types/types";
import { toDataUrl } from "../utils/utils";

export async function transformDom(node: ScrapedElement): Promise<[ScrapedHtmlElement, ScrapedElement[]]> {
    const removable = new Set(['script', 'link', 'style', 'iframe']);
    const leftovers: ScrapedElement[] = [];
    const trimmed = await dig(node) as ScrapedHtmlElement;
    return [trimmed, leftovers];

    async function dig(node: ScrapedElement): Promise<ScrapedElement | undefined> {
        if(node.type === 'element') {
            if(removable.has(node.tag)) {
                leftovers.push(node)
                return undefined;
            } else {
                const children = await Promise.all(node.children.map(dig));
                return await transformNode({
                    ...node,
                    children: children.filter(child => child !== undefined) as ScrapedElement[],
                    attributes: node.attributes.filter(filterAttribute).map(transformAttribute)
                })
            }
        } else {
            return node;
        }
    }
}

async function transformNode(node: ScrapedElement) {
    if(node.type === 'element' && node.tag === 'img') {
        const image = node.el as HTMLImageElement;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.height = image.naturalHeight;
        canvas.width = image.naturalWidth;
        ctx.drawImage(image, 0, 0);
        const src = node.attributes.find(attr => attr.name === 'src');
        if(src) {
            try {
                const data = await new Promise<string>((resolve, reject) => {
                    canvas.toBlob((blob) => {
                        if(!blob) throw new Error('Failed to create blob');
                        toDataUrl(blob).then((dataUrl) => {
                            resolve(dataUrl)
                        });
                    })
                });
                src.value = data;
            } catch(e) {
                if(src.value.startsWith('//')) {
                    src.value = src.value.replace('//', location.protocol + '//');
                }
            }
        }
    }
    const { el, ...others } = node;
    if(others.type === 'element' && others.children.length === 0) {
        others.children = [];
    }
    return others;
}

function filterAttribute(attr: ScrapedAttribute) {
    if(/^on[a-z]+/.test(attr.name)) {
        return false;
    } else if(/^javascript:/i.test(attr.value)) {
        return false;
    } else {
        return true;
    }
}

function transformAttribute(attr: ScrapedAttribute) {
    let newVal;
    if(attr.name === 'href') {
        newVal = "";
    }
    return { ...attr, newVal };
}