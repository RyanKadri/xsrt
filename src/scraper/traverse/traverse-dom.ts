import { ScrapedHtmlElement, ScrapedTextElement, ScrapedElement } from "../types/types";
import { isElementNode, isTextNode } from "../utils/utils";
import { shouldTraverseNode } from "../filter/filter-dom";
import { transformElement, transformText } from "../transform/transform-dom";

export class DomTraverser {
    
    private idSeq = 0;
    private nodeMapping = new Map<Node, ScrapedElement>();

    traverseNode = (node: Node): ScrapedElement | undefined => {
        const cached = this.nodeMapping.get(node);
        if(cached) {
            return cached;
        } else {
            const result = isElementNode(node) ? this.extractElement(node) 
                : isTextNode(node) ? this.extractText(node)
                : undefined;
            if(result) {
                this.nodeMapping.set(node, result);
            }
            return result;
        }
    }

    isManaged(node: Node) {
        return this.nodeMapping.has(node);
    }

    // Note that if you start on an invalid object as the root, this will still scrape.
    private extractElement(node: HTMLElement): ScrapedHtmlElement {
        return transformElement(
            this.scrapeBasicElement(node)
        );
    }
    
    private scrapeBasicElement(node: HTMLElement): ScrapedHtmlElement {
        return {
            type: 'element',
            id: this.nextId(),
            domElement: node,
            value: 'value' in node ? node['value'] : undefined,
            tag: node.tagName.toLowerCase(),
            attributes: Array.from(node.attributes).map(attr => ({ name: attr.name, value: attr.value })),
            children: Array.from(node.childNodes)
                .filter(shouldTraverseNode)
                .map(this.traverseNode) as ScrapedElement[]
        }
    }
    
    private extractText(node: Element): ScrapedTextElement {
        return transformText(
            this.scrapeBasicText(node)
        );
    }
    
    private scrapeBasicText(node: Element): ScrapedTextElement {
        return {
            type: 'text',
            id: this.nextId(),
            content: node.textContent || '',
            domElement: node
        }
    }

    private nextId() {
        return this.idSeq++;
    }
}