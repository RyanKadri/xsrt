import { injectable } from "inversify";
import { shouldTraverseNode } from "../filter/filter-dom";
import { transformElement, transformText } from "../transform/transform-dom";
import { ScrapedElement, ScrapedHtmlElement, ScrapedTextElement } from "../types/types";
import { isElementNode, isTextNode } from "../utils/utils";

@injectable()
export class RecordingDomManager {
    
    private idSeq = 0;

    private nodeMapping = new Map<Node, ScrapedElement>();
    private idMapping = new Map<number, ScrapedElement>();

    traverseNode: {
        (node: HTMLElement): ScrapedHtmlElement;
        (node: Element): ScrapedTextElement;
        (node: Comment): undefined
        (node: Node): ScrapedElement | undefined
    } = (node: any): any => {
        const result = isElementNode(node) ? this.extractElement(node) 
            : isTextNode(node) ? this.extractText(node)
            : undefined;
        if(result) {
            this.nodeMapping.set(node, result);
            this.idMapping.set(result.id, result);
        }
        return result;
    }

    fetchManagedNode(node: HTMLElement): ScrapedHtmlElement;
    fetchManagedNode(node: Element): ScrapedTextElement;
    fetchManagedNode(node: Node): ScrapedElement
    fetchManagedNode(node: Node, strict: false): ScrapedElement | undefined
    fetchManagedNode(node: Node, strict: boolean = true): ScrapedElement | undefined {
        const res = this.nodeMapping.get(node);
        if(!res && strict) throw new Error('Could not find managed node for: ' + node.textContent); //TODO - Make this less bad
        return res;
    }

    fetchScrapedNodeById = (id: number): ScrapedElement | undefined => {
        return this.idMapping.get(id);
    }

    isManaged(node: Node | null | undefined) {
        return node !== undefined && node !== null && this.nodeMapping.has(node);
    }

    dump() {
        return this.nodeMapping;
    }

    private extractElement(node: HTMLElement): ScrapedHtmlElement {
        return transformElement(
            this.scrapeBasicElement(node)
        );
    }
    
    private scrapeBasicElement(node: HTMLElement): ScrapedHtmlElement {
        const id = this.isManaged(node) ? this.fetchManagedNode(node).id : this.nextId();
        return {
            type: 'element',
            id,
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
        const id = this.isManaged(node) ? this.fetchManagedNode(node).id : this.nextId();
        return {
            type: 'text',
            id,
            content: node.textContent || '',
            domElement: node
        }
    }

    private nextId() {
        return this.idSeq++;
    }
}