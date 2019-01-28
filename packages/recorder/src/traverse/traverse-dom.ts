import { ScrapedElement, ScrapedHtmlElement, ScrapedTextElement, ScraperConfig, ScraperConfigToken, transformTree } from "@xsrt/common";
import { inject, injectable } from "inversify";
import { shouldTraverseNode } from "../filter/filter-dom";
import { transformElement, transformText } from "../transform/transform-dom";
import { isElementNode, isTextNode, nodeIsHidden } from "../utils/dom-utils";

@injectable()
export class RecordingDomManager {

    constructor(
        @inject(ScraperConfigToken) private config: ScraperConfig
    ) {}
    private idSeq = 0;

    private nodeMapping = new Map<Node, ScrapedElement>();
    private idMapping = new Map<number, ScrapedElement>();

    traverseNode(node: HTMLElement): ScrapedHtmlElement;
    traverseNode(node: Element): ScrapedTextElement;
    traverseNode(node: Comment): undefined;
    traverseNode(node: Node): ScrapedElement | undefined;
    traverseNode(node: Node): ScrapedElement | undefined {
        return transformTree<Node, ScrapedElement>(node, currNode => {
            const result = isElementNode(currNode) ? this.extractElement(currNode)
                : isTextNode(currNode) ? this.extractText(currNode)
                : undefined;
            if (this.config) {
                (currNode as any)["debug-scrape-node"] = result;
            }
            if (result) {
                this.nodeMapping.set(currNode, result);
                this.idMapping.set(result.id, result);
            }
            return result;
        }, (currNode) => Array.from(currNode.childNodes).filter(shouldTraverseNode));
    }

    fetchManagedNode(node: HTMLElement): ScrapedHtmlElement;
    fetchManagedNode(node: Element): ScrapedTextElement;
    fetchManagedNode(node: Node): ScrapedElement;
    fetchManagedNode(node: Node, strict: false): ScrapedElement | undefined;
    fetchManagedNode(node: Node, strict: boolean = true): ScrapedElement | undefined {
        const res = this.nodeMapping.get(node);
        if (!res && strict) {
            // TODO - Make this error message less bad
            throw new Error("Could not find managed node for: " + node.textContent);
        }
        return res;
    }

    fetchScrapedNodeById = (id: number): ScrapedElement | undefined => {
        return this.idMapping.get(id);
    }

    isManaged(node: Node | null | undefined) {
        return node !== undefined && node !== null && this.nodeMapping.has(node);
    }

    isHidden(node: Node) {
        return nodeIsHidden(node);
    }

    dump() {
        return this.idMapping;
    }

    private extractElement(node: HTMLElement): ScrapedHtmlElement {
        return transformElement(
            this.scrapeBasicElement(node)
        );
    }

    private scrapeBasicElement(node: HTMLElement): ScrapedHtmlElement {
        const id = this.isManaged(node) ? this.fetchManagedNode(node).id : this.nextId();
        return {
            type: "element",
            id,
            domElement: node,
            value: node instanceof HTMLInputElement ? node.value : undefined,
            tag: node.tagName.toLowerCase(),
            attributes: Array.from(node.attributes).map(attr => ({ name: attr.name, value: attr.value })),
            children: []
        };
    }

    private extractText(node: Element): ScrapedTextElement {
        return transformText(
            this.scrapeBasicText(node)
        );
    }

    private scrapeBasicText(node: Element): ScrapedTextElement {
        const id = this.isManaged(node) ? this.fetchManagedNode(node).id : this.nextId();
        return {
            type: "text",
            id,
            content: node.textContent || "",
            domElement: node
        };
    }

    private nextId() {
        return this.idSeq++;
    }
}
