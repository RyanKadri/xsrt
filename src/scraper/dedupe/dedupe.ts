import { DedupedData, ScrapedData } from "../scrape";
import { ScrapedHtmlElement, ScrapedStyleRule, ScrapedElement } from "../types/types";
import { UrlReferenceMapping } from "../transform/transform-styles";
import { toDataUrl, normalizeUrl } from "../utils/utils";

let refId = 0;
export async function dedupe(data: ScrapedData): Promise<DedupedData> {
    const { root, assets: initAssets } = dedupeRoot(data.root, {});
    const { styles, assets } = dedupeStyles(data.styles, initAssets);
    const resolvedAssets = await resolveAssets(assets);
    return { 
        ...data,
        root,
        styles,
        assets: resolvedAssets
    } as DedupedData;
}

// Screw this whole functional programming thing!
function dedupeRoot(root: ScrapedHtmlElement, assets: UrlReferenceMapping): { root: ScrapedHtmlElement, assets: UrlReferenceMapping } {
    processSubtree(root, assets);
    return { root, assets };
}

function processSubtree(node: ScrapedElement, assets: UrlReferenceMapping): void {
    if(node.type === 'element') {
        processNode(node, assets)
        node.children.forEach(child => processSubtree(child, assets));
    }
}

function processNode(node: ScrapedHtmlElement, assets: UrlReferenceMapping): void {
    switch(node.tag) {
        case 'img': 
            return dedupeImage(node, assets)
        default:
            return undefined;
    }
}

// Specifically for images (and maybe some other elements like canvas, video, etc), we can grab the data
// without a fetch. Maybe assets supports some kind of generic resolver callback rather than just url;
function dedupeImage(node: ScrapedHtmlElement, assets: UrlReferenceMapping): void {
    const src = node.attributes.find(attr => attr.name === 'src');
    if(src) {
        const url = src.value;
        let ref = assets[url];
        if(!ref) {
            ref = assets[url] = '' + refId ++;
        }
        src.value = `##${ref}##`;
        src.references = [ref]
    }
    
    // const image = node.domElement as HTMLImageElement;
    // const canvas = document.createElement('canvas');
    // const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    // canvas.height = image.naturalHeight;
    // canvas.width = image.naturalWidth;
    // ctx.drawImage(image, 0, 0);
    // if(src) {
    //     try {
    //         const data = await new Promise<string>((resolve, reject) => {
    //             canvas.toBlob((blob) => {
    //                 if(!blob) throw new Error('Failed to create blob');
    //                 toDataUrl(blob).then((dataUrl) => {
    //                     resolve(dataUrl)
    //                 });
    //             })
    //         });
    //         src.value = data;
    //     } catch(e) {
    //         if(src.value.startsWith('//')) {
    //             src.value = src.value.replace('//', location.protocol + '//');
    //         }
    //     }
    // }
}

function dedupeStyles(rules: ScrapedStyleRule[], initAssets: UrlReferenceMapping): { styles: ScrapedStyleRule[], assets: UrlReferenceMapping } {
    const assets = extractStyleUrls(rules, initAssets);
    return { 
        styles: replaceUrlsInRules(rules, assets),
        assets
    }
}

function replaceUrlsInRules(rules: ScrapedStyleRule[], assets: UrlReferenceMapping): ScrapedStyleRule[] {
    return rules.map(rule => ({
        ...rule,
        ...replaceUrls(rule, assets)
    })) as ScrapedStyleRule[];
}

function replaceUrls(rule: ScrapedStyleRule, assets: UrlReferenceMapping): Partial<ScrapedStyleRule> {
    return (rule.references || [])
        .reduce((curr, ref, i) => {
            const refNum = assets[normalizeUrl(ref, rule.source)];
            curr.references[i] = '' + refNum
            return {
                text: curr.text.replace(ref, `##${refNum}##`),
                references: curr.references
            }
        }, { text: rule.text, references: rule.references! });
}

function extractStyleUrls(rules: ScrapedStyleRule[], mapping: UrlReferenceMapping) {
    const updated = { ...mapping };
    rules.forEach(rule => {
        (rule.references || [])
            .map(ref => normalizeUrl(ref, rule.source))
            .forEach(ref => {
                if(!updated[ref]) {
                    updated[ref] = '' + refId++;
                }
            });
    })
    return updated;
}

async function resolveAssets(assets: UrlReferenceMapping): Promise<string[]> {
    const resolved = await Promise.all(
        Object.entries(assets)
            .map(async ([url, id]) => {
                return fetch(url)
                    .then(resp => resp.blob())
                    .then(blob => toDataUrl(blob))
                    .then(dataUrl => ({id, url: dataUrl }))
                    .catch(() => ({ id, url })) //TODO - How do we want to handle this case? Falling back to old link is probably not the
            })
    );
    return resolved.reduce((acc, el) => {
        acc[el.id] = el.url;
        return acc;
    }, [] as string[])
}