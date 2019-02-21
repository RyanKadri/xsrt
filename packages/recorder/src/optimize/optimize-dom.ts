import { ScrapedElement, ScrapedHtmlElement, ScrapedAttribute, OptimizedElement, OptimizedHtmlElementInfo, formatAssetRef } from "@xsrt/common";
import { optimizeStyle } from "./optimize-styles";
import { extractUrls } from "../transform/transform-styles";
import { OptimizationContext } from "./optimization-context";

export function optimizeNode(root: ScrapedElement, context: OptimizationContext): OptimizedElement {
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
                return base;
        }
    } else {
        const { domElement, ...base } = root;
        return base;
    }
}

// Specifically for images (and maybe some other elements like canvas, video, etc), we can grab the data
// without a fetch. Maybe assets supports some kind of generic resolver callback rather than just url;
function optimizeImage(node: ScrapedHtmlElement, context: OptimizationContext): OptimizedHtmlElementInfo {
    const src = node.attributes.find(attr => attr.name === "src")!;
    const assetId = context.registerAsset(src.value);
    return {
        ...node,
        attributes: node.attributes.map(attr =>
            attr.name === "src"
                ? { ...attr, value: formatAssetRef(assetId), references: [assetId]}
                : attr
        )
    };

}

function extractInlineStyles(node: ScrapedHtmlElement, context: OptimizationContext): ScrapedHtmlElement {
    return {
        ...node,
        attributes: node.attributes.map(
            attr => attr.name === "style" ? extractInlineStyle(attr, context) : attr
        )
    };
}

function extractInlineStyle(attr: ScrapedAttribute, context: OptimizationContext): ScrapedAttribute {
    const urls = extractUrls(attr.value);
    let rule = attr.value;
    const references: number[] = [];
    for (const url of urls) {
        const id = context.registerAsset(url);
        rule = rule.replace(url, formatAssetRef(id));
        references.push(id);
    }
    return {
        name: attr.name,
        value: rule,
        references
    };
}
