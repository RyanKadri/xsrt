import { nodeIsHidden, isElementNode, isTextNode } from "../utils/utils";

const removable = new Set(['script', 'link', 'style', 'iframe']);
export function shouldTraverseNode(node: Node) {
    return isElementNode(node) ? shouldTraverseElement(node)
        : isTextNode(node) ? shouldTraverseText(node)
        : false;
}

function shouldTraverseElement(node: HTMLElement) {
    return !nodeIsHidden(node) && !removable.has(node.tagName.toLowerCase());
}

// TODO - We could potentially be more greedy here but things like white-space: pre make that hard
function shouldTraverseText(node: Element) {
    return node.textContent !== '';
}