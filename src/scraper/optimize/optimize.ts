import { DedupedData, ScrapedData } from "../types/types";
import { UrlReferenceMapping } from "../transform/transform-styles";
import { toDataUrl } from "../utils/utils";
import { dedupeStyles } from "./optimize-styles";
import { optimizeRoot } from "./optimize-dom";

let refId = 0;
const generateId = () => {
    return refId ++;
}

export async function optimize(data: ScrapedData): Promise<DedupedData> {
    const { root, assets: initAssets } = optimizeRoot(data.root, {}, generateId);
    const { styles, assets } = dedupeStyles(data.styles, initAssets, generateId);
    const resolvedAssets = await resolveAssets(assets);
    return { 
        ...data,
        root,
        styles,
        assets: resolvedAssets
    } as DedupedData;
}

async function resolveAssets(assets: UrlReferenceMapping): Promise<string[]> {
    const resolved = await Promise.all(
        Object.entries(assets)
            .map(async ([url, id]) => {
                return fetch(url)
                    .then(resp => resp.blob())
                    .then(blob => toDataUrl(blob))
                    .then(dataUrl => ({id, url: dataUrl }))
                    .catch(() => ({ id, url })) //TODO - How do we want to handle this case? Falling back to old link is probably not the
            })
    );
    return resolved.reduce((acc, el) => {
        acc[el.id] = el.url;
        return acc;
    }, [] as string[])
}