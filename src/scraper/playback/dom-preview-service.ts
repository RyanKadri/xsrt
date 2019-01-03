import { injectable } from "inversify";
import { between, pipe, pluck, reverseFind, toKeyValMap } from "../../common/utils/functional-utils";
import { OptimizedElement, RecordedMutationGroup, ScrapedElement, SnapshotChunk } from "../types/types";
import { findInTree } from "../utils/tree-utils";

@injectable()
export class DomPreviewService {

    private snapshots: SnapshotChunk[] = [];
    private changes: RecordedMutationGroup[] = [];
    
    registerUpdate(update: DomPreviewUpdate) {
        this.snapshots = update.snapshots;
        this.changes = update.changes;
    }

    previewNode(target: number, time: number): DomNodePreview {
        const snapshotChunk = reverseFind(this.snapshots, snapshot => snapshot.metadata.startTime < time)!;
        const relevantChanges = this.changes.filter(pipe(
            pluck('timestamp'),
            between(snapshotChunk.metadata.startTime, time
        )));

        const snapshotNode = this.searchForNode(target, snapshotChunk.snapshot.root);
        let preview: DomNodePreview = snapshotNode 
            ? this.convertToPreview(snapshotNode)
            : { type: 'element', attributes: {}, tag: '' }

        for(const changeGroup of relevantChanges) {
            for(const mutation of changeGroup.mutations) {
                if(mutation.type === 'attribute' && mutation.target === target) {
                    const htmlPreview = (preview as HtmlNodePreview);
                    htmlPreview.attributes[mutation.name] = mutation.val;
                } else if(mutation.type === 'change-text' && mutation.target === target) {
                    const textPreview = (preview as TextNodePreview);
                    textPreview.content = mutation.update
                } else if(mutation.type === 'children' && mutation.additions) {
                    for(const addition of mutation.additions) {
                        const newAddition = this.searchForNode(target, addition.data)
                        if(newAddition) {
                            preview = this.convertToPreview(newAddition);
                        }
                    }
                }
            }
        }

        return preview;
    }

    private convertToPreview(el: ScrapedElement | OptimizedElement): DomNodePreview {
        return el.type === 'element' 
                ? { type: 'element', tag: el.tag, attributes: toKeyValMap((el.attributes || []), el => el.name, el => el.value) }
                : { type: 'text', content: el.content }
    }

    private searchForNode(target: number, root: ScrapedElement | OptimizedElement) {
        return findInTree(
            root,
            addition => addition.id === target,
            node => node.type === 'element' ? node.children : undefined
        );
    }
}

export interface DomPreviewUpdate {
    snapshots: SnapshotChunk[];
    changes: RecordedMutationGroup[];
}

export type DomNodePreview = TextNodePreview | HtmlNodePreview;

export interface TextNodePreview {
    type: 'text';
    content: string;
}

export interface HtmlNodePreview {
    type: 'element';
    tag: string;
    attributes: {
        [name: string]: string;
    }
}