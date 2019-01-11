import { injectable } from "inversify";
import { Without } from "../../common/utils/type-utils";
import { AssetResolver } from "../assets/asset-resolver";
import { OptimizedElement, OptimizedHtmlElementInfo, ScrapedElement, SnapshotChunk, UnoptimizedSnapshotChunk } from "../types/types";
import { optimizeNode } from "./optimize-dom";

@injectable()
export class RecordingOptimizer {

    constructor(
        private resolver: AssetResolver
    ) {}

    async optimize(data: UnoptimizedSnapshotChunk): Promise<Without<SnapshotChunk, "_id">> {
        if (data.type === "snapshot") {
            const { context, root } = this.optimizeSubtree(data.snapshot.root, { assets: [] });
            const assets = await this.resolver.resolveAssets(context.assets);
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

    private optimizeSubtree = (root: ScrapedElement, inContext: OptimizationContext): OptimizationResult => {
        const optResult = optimizeNode(root, inContext);
        let { context } = optResult;
        const { nodeTask } = optResult;

        if (root.type === "element") {
            const childTasks: (OptimizedElement | Promise<OptimizedElement>)[] = [];
            for (const child of root.children) {
                const optimizationResult = this.optimizeSubtree(child, context);
                context = optimizationResult.context;
                childTasks.push(optimizationResult.root);
            }
            return {
                root: Promise.all([nodeTask, ...childTasks])
                    .then(([taskRoot, ...children]) => ({
                        ...taskRoot,
                        children
                    })),
                context
            };
        } else {
            return {
                root: nodeTask,
                context
            } as OptimizationResult;
        }
    }
}

export interface OptimizationContext {
    assets: string[];
}

export interface OptimizationResult {
    root: Promise<OptimizedElement>;
    context: OptimizationContext;
}

export interface NodeOptimizationResult {
    nodeTask: OptimizedElement | Promise<OptimizedElement>;
    context: OptimizationContext;
}
