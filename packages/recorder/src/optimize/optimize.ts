import { AttributeMutation, OptimizedChildrenMutation, OptimizedElement, OptimizedHtmlElementInfo, PendingDiffChunk, PendingSnapshotChunk, RecordingChunk, RootSnapshot, ScrapedElement, ScrapedHtmlElement, UnoptimizedSnapshotChunk } from "@xsrt/common";
import { injectable } from "inversify";
import { OptimizationContext } from "./optimization-context";
import { extractInlineStyle, optimizeNode } from "./optimize-dom";

@injectable()
export class RecordingOptimizer {

    // Use the same optimization context as long as you are in the same JS execution context
    private context = new OptimizationContext();

    optimize(data: UnoptimizedSnapshotChunk): PendingSnapshotChunk;
    optimize(data: PendingDiffChunk): PendingDiffChunk;
    optimize(data: UnoptimizedSnapshotChunk | PendingDiffChunk): any {
        let snapshot: RootSnapshot | {} = {};
        if (data.type === "snapshot") {
            const root = this.optimizeSubtree(data.snapshot.root) as OptimizedHtmlElementInfo;
            snapshot = {
                documentMetadata: data.snapshot!.documentMetadata,
                root
            };
        }
        const changes = data.changes.map(change => {
            return {
                ...change,
                mutations: change.mutations.map(mutation => mutation.type === "children"
                    ? this.optimizeChildrenMutation(mutation)
                    : mutation.type === "attribute"
                        ? this.optimizeAttributeMutation(mutation)
                        : mutation
                )
            };
        });

        return {
            ...data,
            snapshot,
            changes,
            assets: this.context.getAssets().map(asset => this.resolveFullRequestUrl(asset)),
        } as RecordingChunk;
    }

    private optimizeAttributeMutation(mutation: AttributeMutation) {
        if (mutation.attribute.name === "style") {
            const attribute = extractInlineStyle(mutation.attribute, this.context);
            return { ...mutation, attribute };
        } else {
            return mutation;
        }
    }

    private optimizeChildrenMutation(mutation: OptimizedChildrenMutation) {
        return {
            ...mutation,
            additions: (mutation.additions || []).map(addition => ({
                ...addition,
                data: this.optimizeSubtree(addition.data)
            }))
        };
    }

    // context holds multable state (assets URLs discovered over time);
    private optimizeSubtree = (root: ScrapedElement): OptimizedElement => {
        const node = optimizeNode(root, this.context);

        if (node.type === "element") {
            const childTasks: OptimizedElement[] = [];
            for (const child of (root as ScrapedHtmlElement).children) {
                const optimizationResult = this.optimizeSubtree(child);
                childTasks.push(optimizationResult);
            }
            return {
                ...node,
                children: childTasks
            };
        } else {
            return node;
        }
    }

    private resolveFullRequestUrl(forAsset: string) {
        const testLink = document.createElement("a");
        testLink.href = forAsset;
        return testLink.href;
    }
}

export interface OptimizationResult {
    root: Promise<OptimizedElement>;
}
