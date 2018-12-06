import { DedupedData, ScrapedData, OptimizedElement, ScrapedElement } from "../types/types";
import { optimizeNode } from "./optimize-dom";
import { injectable } from "inversify";
import { AssetResolver } from "../assets/asset-resolver";

@injectable()
export class RecordingOptimizer {

    constructor(
        private resolver: AssetResolver
    ) {}

    async optimize(data: ScrapedData): Promise<DedupedData> {
        const { context, root } = this.optimizeSubtree(data.root, { assets: [] });
        const assets = await this.resolver.resolveAssets(context.assets);
    
        return { 
            ...data,
            root: await root,
            assets
        } as DedupedData;
    }
    
    private optimizeSubtree = (root: ScrapedElement, inContext: OptimizationContext): OptimizationResult => {
        let { nodeTask, context } = optimizeNode(root, inContext);
        if(root.type === 'element') {
            const childTasks: (OptimizedElement | Promise<OptimizedElement>)[] = [];
            for(const child of root.children) {
                const optimizationResult = this.optimizeSubtree(child, context);
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
