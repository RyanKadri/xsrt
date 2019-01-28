import { isElementNode, isTextNode, nodeIsHidden } from "../utils/dom-utils";

const removable = new Set(["script", "iframe", "link"]);
export function shouldTraverseNode(node: Node) {
    return isElementNode(node) ? shouldTraverseElement(node)
        : isTextNode(node) ? shouldTraverseText(node)
        : false;
}

function shouldTraverseElement(node: HTMLElement) {
    return (!nodeIsHidden(node) && !removable.has(node.tagName.toLowerCase()))
        || (node.tagName.toLowerCase() === "link" && (node as HTMLLinkElement).rel === "stylesheet");
}

// TODO - We could potentially be more greedy here but things like white-space: pre make that hard
function shouldTraverseText(node: Element) {
    return node.textContent !== "";
}
