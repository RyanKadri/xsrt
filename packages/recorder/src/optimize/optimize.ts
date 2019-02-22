import { AttributeMutation, OptimizedChildrenMutation, OptimizedElement, OptimizedHtmlElementInfo, PendingDiffChunk, PendingSnapshotChunk, RecordingChunk, RootSnapshot, ScrapedElement, UnoptimizedSnapshotChunk } from "@xsrt/common";
import { injectable } from "inversify";
import { AssetResolver } from "../assets/asset-resolver";
import { OptimizationContext } from "./optimization-context";
import { extractInlineStyle, optimizeNode } from "./optimize-dom";

@injectable()
export class RecordingOptimizer {

    // Use the same optimization context as long as you are in the same JS execution context
    private context = new OptimizationContext();

    constructor(
        private resolver: AssetResolver
    ) {}

    async optimize(data: UnoptimizedSnapshotChunk): Promise<PendingSnapshotChunk>;
    async optimize(data: PendingDiffChunk): Promise<PendingDiffChunk>;
    async optimize(data: UnoptimizedSnapshotChunk | PendingDiffChunk): Promise<any> {
        let snapshot: RootSnapshot | {} = {};
        if (data.type === "snapshot") {
            const root = await this.optimizeSubtree(data.snapshot.root) as OptimizedHtmlElementInfo;
            snapshot = {
                documentMetadata: data.snapshot!.documentMetadata,
                root
            };
        }
        const changes = await Promise.all(data.changes.map(async change => {
            return {
                ...change,
                mutations: await Promise.all(change.mutations.map(async mutation => mutation.type === "children"
                    ? this.optimizeChildrenMutation(mutation)
                    : mutation.type === "attribute"
                        ? this.optimizeAttributeMutation(mutation)
                        : await Promise.resolve(mutation)
                ))
            };
        }));

        return {
            ...data,
            snapshot,
            changes,
            assets: await this.resolver.resolveAssets(this.context.getAssets()),
        } as RecordingChunk;
    }

    private async optimizeAttributeMutation(mutation: AttributeMutation) {
        if (mutation.attribute.name === "style") {
            const attribute = extractInlineStyle(mutation.attribute, this.context);
            return { ...mutation, attribute };
        } else {
            return mutation;
        }
    }

    private async optimizeChildrenMutation(mutation: OptimizedChildrenMutation) {
        return {
            ...mutation,
            additions: await Promise.all((mutation.additions || []).map(async addition => ({
                ...addition,
                data: await this.optimizeSubtree(addition.data)
            })))
        };
    }

    // context holds multable state (assets URLs discovered over time);
    private optimizeSubtree = (root: ScrapedElement): Promise<OptimizedElement> => {
        const node = optimizeNode(root, this.context);

        if (root.type === "element") {
            const childTasks: (OptimizedElement | Promise<OptimizedElement>)[] = [];
            for (const child of root.children) {
                const optimizationResult = this.optimizeSubtree(child);
                childTasks.push(optimizationResult);
            }
            return Promise.all([node, ...childTasks])
                .then(([taskRoot, ...children]) => ({
                    ...taskRoot,
                    children
                }));
        } else {
            return Promise.resolve(node);
        }
    }
}

export interface OptimizationResult {
    root: Promise<OptimizedElement>;
}
