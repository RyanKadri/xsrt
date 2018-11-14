import { ScrapedHtmlElement, ScrapedElement } from "../types/types";
import { OptimizationContext, NodeOptimizationResult } from "./optimize";
import { optimizeStyle } from "./optimize-styles";

export function optimizeNode(root: ScrapedElement, context: OptimizationContext): NodeOptimizationResult {
    if(root.type === 'element') {
        switch(root.tag) {
            case 'img': 
                return optimizeImage(root, context);
            case 'style':
            case 'link':
                return optimizeStyle(root, context);
            default:
                //TODO - How do we ensure domElement is removed from all optimized elements (even if they need to resolve a promise)?
                const { domElement, ...base } = root;
                return {
                    nodeTask: base,
                    context
                };
        }
    } else {
        const { domElement, ...others } = root;
        return {
            nodeTask: others,
            context
        }
    }
}

// Specifically for images (and maybe some other elements like canvas, video, etc), we can grab the data
// without a fetch. Maybe assets supports some kind of generic resolver callback rather than just url;
function optimizeImage(node: ScrapedHtmlElement, context: OptimizationContext): NodeOptimizationResult {
    const src = node.attributes.find(attr => attr.name === 'src')!;
    let assetInd = context.assets.findIndex(asset => asset === src.value);
    let assets = context.assets;

    if(assetInd === -1) {
        assetInd = assets.length;
        assets = assets.concat(src.value);
    }
    return {
        nodeTask: {
            ...node,
            attributes: node.attributes.map(attr => 
                attr.name === 'src'
                    ? { ...attr, value: `##${assetInd}##`, references: ['' + assetInd]}
                    : attr
            )
        },
        context: {
            assets
        }
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