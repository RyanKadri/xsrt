import { ScrapedAttribute, DedupedData, OptimizedElement, OptimizedStyleRule, OptimizedHtmlElementInfo } from "../types/types";
import { toBlobUrl } from "../utils/utils";

export class DomManager {

    constructor(
        private document: Document
    ) {}

    private nodeMapping = new Map<number, Node>();
    private assets: string[] = [];

    async serializeToDocument(data: DedupedData): Promise<void> {
        this.assets = await this.adjustReferences(data.assets);
        
        const docType = `<!DOCTYPE ${ data.metadata.docType }>`
        this.document.write(docType + '\n<html></html>');
        
        this.document.removeChild(this.document.documentElement!);
        this._serializeToElement(this.document, data.root);
        
        const styles = this.serializeStyles(data.styles);
        const styleElement = this.document.createElement('style');
        styleElement.innerHTML = styles;
    
        this.document.head!.appendChild(styleElement);
    }
    
    serializeToElement(parent: number, node: OptimizedElement, before: number | null = null) {
        const parentNode = this.fetchNode(parent);
        this._serializeToElement(parentNode, node, undefined, before)
    }
    
    removeChild(target: number, child: number) {
        this.fetchNode(target).removeChild(this.fetchNode(child))
    }
    
    updateText(target: number, newText: string) {
        this.fetchNode(target).textContent = newText;
    }

    setAttribute(target: number, attr: string, val: string) {
        (this.fetchNode(target) as Element).setAttribute(attr, val);
    }
    
    removeAttribute(target: number, attr: string) {
        (this.fetchNode(target) as Element).removeAttribute(attr);
    }

    mutateElement(target: number, cb: (node: HTMLElement) => void) {
        cb(this.fetchNode(target) as HTMLElement);
    }
    
    private _serializeToElement(parent: Node, node: OptimizedElement, currNS = '', before: number | null = null) {
        const created = node.type === 'element'
            ? this.createElement(node, currNS)
            : this.document.createTextNode(node.content);
        created['debug-scrape-data'] = node;

        this.nodeMapping.set(node.id, created);
        if(before) {
            if(this.nodeMapping.has(before)) {
                parent.insertBefore(created, this.nodeMapping.get(before)!)
            }
        } else {
            parent.appendChild(created);
        }
    }

    private fetchNode(id: number) {
        return this.nodeMapping.get(id)!
    }
    
    private createElement(node: OptimizedHtmlElementInfo, currNS = '') {
        const attributes = node.attributes || [];
        const nsAttr = (attributes).find(attr => attr.name === 'xmlns');
        const ns = nsAttr ? nsAttr.value : currNS;
        let created = ns ? this.document.createElementNS(ns, node.tag): this.document.createElement(node.tag) as Element;
        
        attributes.forEach(attr => this._setAttribute(created, attr));
        if(node.children) {
            node.children.forEach(child => this._serializeToElement(created, child, ns))
        }
        if(node.value && 'value' in created) {
            (created as HTMLInputElement).value = '' + node.value;
        }
        return created;
    }
    
    private serializeStyles(styles: OptimizedStyleRule[]) {
        return styles.map(style => {
            if(!style.references) {
                return style.text;
            } else {
                return this.replaceReferences(style.text, style.references);
            }
        }).join('');
    }
    
    private _setAttribute(node: Element, attr: ScrapedAttribute) {
        let val: string;
        if(attr.references) {
            val = this.replaceReferences(attr.value, attr.references);
        } else {
            val = attr.value;
        }
        node.setAttribute(attr.name, val);
    }
    
    private replaceReferences(valWithRefs: string, references: string[]) {        
        references.forEach(ref => {
            valWithRefs = valWithRefs.replace(`##${ref}##`, this.assets[ref]);
        })
        return valWithRefs;
    }
    
    private adjustReferences(refs: string[]) {
        return Promise.all(
            refs.map(toBlobUrl)
        );
    }
}