import { ScrapedElement, ScrapedHtmlElement, ScrapedAttribute } from "@xsrt/common";
import { NodeOptimizationResult, OptimizationContext } from "./optimize";
import { optimizeStyle } from "./optimize-styles";
import { extractUrls } from "../transform/transform-styles";

export function optimizeNode(root: ScrapedElement, context: OptimizationContext): NodeOptimizationResult {
    if (root.type === "element") {
        const withInlineStyles = extractInlineStyles(root, context);
        switch (root.tag) {
            case "img":
                return optimizeImage(withInlineStyles, context);
            case "style":
            case "link":
                return optimizeStyle(withInlineStyles, context);
            default:
                // TODO - How do we ensure domElement is removed from all optimized elements
                // (even if they need to resolve a promise)?
                const { domElement, ...base } = withInlineStyles;
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
        };
    }
}

// Specifically for images (and maybe some other elements like canvas, video, etc), we can grab the data
// without a fetch. Maybe assets supports some kind of generic resolver callback rather than just url;
function optimizeImage(node: ScrapedHtmlElement, { assets }: OptimizationContext): NodeOptimizationResult {
    const src = node.attributes.find(attr => attr.name === "src")!;
    const assetInd = calcAssetInd(assets, src.value);
    return {
        nodeTask: {
            ...node,
            attributes: node.attributes.map(attr =>
                attr.name === "src"
                    ? { ...attr, value: `##${assetInd}##`, references: [assetInd]}
                    : attr
            )
        },
        context: {
            assets
        }
    };

}

function calcAssetInd(assets: string[], src: string) {
    let assetInd = assets.findIndex(asset => asset === src);

    if (assetInd === -1) {
        assetInd = assets.length;
        assets.push(src);
    }
    return assetInd;
}

function extractInlineStyles(node: ScrapedHtmlElement, context: OptimizationContext): ScrapedHtmlElement {
    return {
        ...node,
        attributes: node.attributes.map(
            attr => attr.name === "style" ? extractInlineStyle(attr, context) : attr
        )
    };
}

function extractInlineStyle(attr: ScrapedAttribute, {assets}: OptimizationContext): ScrapedAttribute {
    const urls = extractUrls(attr.value);
    let rule = attr.value;
    const references: number[] = [];
    for (const url of urls) {
        const ind = calcAssetInd(assets, url);
        rule = rule.replace(url, `##${ind}##`);
        references.push(ind);
    }
    return {
        name: attr.name,
        value: rule,
        references
    };
}
