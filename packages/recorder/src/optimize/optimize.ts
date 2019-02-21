import { OptimizedElement, OptimizedHtmlElementInfo, ScrapedElement, SnapshotChunk, UnoptimizedSnapshotChunk, Without } from "@xsrt/common";
import { injectable } from "inversify";
import { AssetResolver } from "../assets/asset-resolver";
import { optimizeNode } from "./optimize-dom";
import { OptimizationContext } from "./optimization-context";

@injectable()
export class RecordingOptimizer {

    constructor(
        private resolver: AssetResolver
    ) {}

    async optimize(data: UnoptimizedSnapshotChunk): Promise<Without<SnapshotChunk, "_id">> {
        if (data.type === "snapshot") {
            const context = new OptimizationContext();
            const root = this.optimizeSubtree(data.snapshot.root, context);
            const assets = await this.resolver.resolveAssets(context.getAssets());
            return {
                ...data,
                snapshot: {
                    documentMetadata: data.snapshot.documentMetadata,
                    root: await root as OptimizedHtmlElementInfo
                },
                assets
            };
        } else {
            throw new Error("Not sure yet how to optimize diff chunks");
        }
    }

    // inContext holds multable state (assets URLs discovered over time);
    private optimizeSubtree = (root: ScrapedElement, inContext: OptimizationContext): Promise<OptimizedElement> => {
        const node = optimizeNode(root, inContext);

        if (root.type === "element") {
            const childTasks: (OptimizedElement | Promise<OptimizedElement>)[] = [];
            for (const child of root.children) {
                const optimizationResult = this.optimizeSubtree(child, inContext);
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
