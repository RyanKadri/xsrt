import { ScrapedAttribute, DedupedData, OptimizedElement, OptimizedStyleRule, OptimizedHtmlElementInfo, OptimizedStyleElement, OptimizedTextElementInfo } from "../types/types";
import { toBlobUrl } from "../utils/utils";

export const IDomManager = Symbol('DomManager');
export class DomManager {

    private _document?: Document;

    private nodeMapping = new Map<number, Node>();
    private assets: string[] = [];

    initialize(document: Document) {
        this._document = document;
    }

    private get document() {
        if(this._document) {
            return this._document;
        } else {
            throw new Error('Document was never provided');
        }
    }

    async serializeToDocument(data: DedupedData): Promise<void> {
        this.assets = await this.adjustReferences(data.assets);
        
        const docType = `<!DOCTYPE ${ data.metadata.docType }>`
        this.document.write(docType + '\n<html></html>');
        
        this.document.removeChild(this.document.documentElement!);
        this._serializeToElement(this.document, data.root);
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

    insertExternalFragment(fragment: string) {
        const el = this.document.createElement('div');
        const shadow = el.attachShadow({ mode: 'open' });
        shadow.innerHTML = fragment;
        this.document.body.appendChild(el);
        return { host: el }
    }

    mutateDocument(cb: (doc: Document) => void) {
        cb(this.document);
    }
    
    elementExists(el?: Node) {
        return el && this.document.contains(el);
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
        if(node.tag === 'style') {
            const rules = (node as OptimizedStyleElement).rules;
            let firstChild = created.firstChild;
            if(!firstChild) {
                firstChild = this.document.createTextNode('');
                created.appendChild(firstChild);
            }
            if(rules) {
                firstChild.textContent = this.serializeStyles((node as OptimizedStyleElement).rules)
            } else {
                firstChild.textContent = node.children.length > 0 ? (node.children[0] as OptimizedTextElementInfo).content : '';
            }
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
            refs.map(ref => {
                return ref.startsWith("data:")
                    ? toBlobUrl(ref)
                    : ref
            })
        );
    }
}