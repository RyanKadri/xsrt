import { ScrapedHtmlElement, OptimizedHtmlElementInfo, ScrapedElement, OptimizedElement, ScrapedAttribute } from "../types/types";
import { UrlReferenceMapping } from "../transform/transform-styles";

export function optimizeRoot(root: ScrapedHtmlElement, assets: UrlReferenceMapping, idGen: () => number)
    :{ root: OptimizedHtmlElementInfo, assets: UrlReferenceMapping } {

    return { 
        root: processSubtree(root, assets, idGen) as OptimizedHtmlElementInfo,
        assets
    };
}

function processSubtree(node: ScrapedElement, assets: UrlReferenceMapping, idGen: () => number): OptimizedElement {
    if(node.type === 'element') {
        return {
            ...processNode(node, assets, idGen),
            children: node.children.length > 0 ? node.children.map(child => processSubtree(child, assets, idGen)): undefined
        }
    } else {
        const { domElement, ...others } = node;
        return others;
    }
}

function processNode(node: ScrapedHtmlElement, assets: UrlReferenceMapping, idGen: () => number): OptimizedHtmlElementInfo {
    const { domElement, ...base } = node;
    switch(node.tag) {
        case 'img': 
            return {
                ...base,
                attributes: optimizeImageAttrs(node, assets, idGen)
            }
        default:
            return base;
    }
}

// Specifically for images (and maybe some other elements like canvas, video, etc), we can grab the data
// without a fetch. Maybe assets supports some kind of generic resolver callback rather than just url;
function optimizeImageAttrs(node: ScrapedHtmlElement, assets: UrlReferenceMapping, idGen: () => number): ScrapedAttribute[] {
    return node.attributes.map(attr => {
        if(attr.name === 'src') {
            const url = attr.value;
            let ref = assets[url];
            if(!ref) {
                ref = assets[url] = '' + idGen();
            }
            return {
                ...attr,
                value: `##${ref}##`,
                references: [ref]
            }
        } else {
            return attr;
        }
    })
    
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