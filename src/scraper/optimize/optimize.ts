import { DedupedData, ScrapedData, OptimizedElement, ScrapedElement } from "../types/types";
import { toDataUrl } from "../utils/utils";
import { optimizeNode } from "./optimize-dom";

export async function optimize(data: ScrapedData): Promise<DedupedData> {
    const { context, root } = optimizeSubtree(data.root, { assets: [] });
    const assets = (await Promise.all(context.assets.map(resolveAsset)));

    return { 
        ...data,
        root: await root,
        assets
    } as DedupedData;
}

function optimizeSubtree(root: ScrapedElement, inContext: OptimizationContext): OptimizationResult {
    let { nodeTask, context } = optimizeNode(root, inContext);
    if(root.type === 'element') {
        const childTasks: (OptimizedElement | Promise<OptimizedElement>)[] = [];
        for(const child of root.children) {
            const optimizationResult = optimizeSubtree(child, context);
            context = optimizationResult.context;
            childTasks.push(optimizationResult.root);
        }
        return {
            root: Promise.all([nodeTask, ...childTasks])
                .then(([root, ...children]) => ({
                    ...root,
                    children
                })),
            context
        }
    } else {
        return {
            root: nodeTask,
            context
        } as OptimizationResult
    }

} 

async function resolveAsset(asset: string): Promise<string> {
    return fetch(asset)
        .then(resp => resp.blob())
        .then(blob => toDataUrl(blob))
        .catch(() => asset) //TODO - How do we want to handle this case? Falling back to old link is probably not the
}

export interface OptimizationContext {
    assets: string[];
}

export interface OptimizationResult {
    root: Promise<OptimizedElement>;
    context: OptimizationContext;
}

export interface NodeOptimizationResult { 
    nodeTask: OptimizedElement | Promise<OptimizedElement>,
    context: OptimizationContext;
}
