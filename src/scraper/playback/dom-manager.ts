import uaStyles from '!raw-loader!./ua-styles.css';
import { DedupedData, OptimizedElement, OptimizedHtmlElementInfo, OptimizedStyleElement, OptimizedStyleRule, OptimizedTextElementInfo, ScrapedAttribute } from "../types/types";
import { toBlobUrl } from "../utils/utils";

// TODO - Maybe in the process of refactoring, this can track a virtual-dom type thing (for testability and separation of concerns)
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

    async createInitialDocument(data: DedupedData): Promise<void> {
        this.assets = await this.adjustReferences(data.assets);
        
        const docType = `<!DOCTYPE ${ data.metadata.docType }>`
        this.document.write(docType + '\n<html></html>');
        
        this.document.removeChild(this.document.documentElement!);
        const head = data.root.children.find(child => child.type === 'element' && child.tag === 'head');
        if(head) {
            (head as OptimizedHtmlElementInfo).children.unshift({ id: -1, type: 'element', tag: 'style', children: [{
                type: 'text',
                content: uaStyles,
                id: -1
            }]})
        }
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

    queryElement<T>(id: number, cb: (node: Node) => T) {
        const node = this.fetchNode(id);
        return cb(node);
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
        const node = this.nodeMapping.get(id);
        if(node) {
            return node;
        } else {
            throw new Error(`Node ${id} does not exist`)
        }
    }
    
    private createElement(node: OptimizedHtmlElementInfo, currNS = '') {
        const attributes = node.attributes || [];
        const nsAttr = (attributes).find(attr => attr.name === 'xmlns');
        let ns: string;
        if(nsAttr) {
            ns = nsAttr.value;
        } else {
            const impNamespace = this.fetchImplicitNamespace(node);
            if(impNamespace) {
                ns = impNamespace;
            } else {
                ns = currNS
            }
        }
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

    private fetchImplicitNamespace(el: OptimizedHtmlElementInfo) {
        switch(el.tag) {
            case 'svg':
                return "http://www.w3.org/2000/svg";
            default:
                return '';
        }
    }
}