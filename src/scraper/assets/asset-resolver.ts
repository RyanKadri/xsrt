import Axios from "axios";
import { inject, injectable } from "inversify";
import { ScraperConfig, ScraperConfigToken } from "../scraper-config";
import { toDataUrl } from "../utils/utils";

@injectable()
export class AssetResolver {

    constructor(
        @inject(ScraperConfigToken) private config: ScraperConfig
    ) {}

    async resolveAssets(assets: string[]): Promise<string[]> {
        try {
            const requestUrls = assets.map(asset => this.resolveFullRequestUrl(asset));
            const res = await Axios.post<{assets: string[]}>(`${this.config.backendUrl}/api/proxy`, { urls: requestUrls });
            return res.data.assets.map(asset => `/api/proxy/${asset}`);
        } catch (e) {
            //TODO - How do we want to handle the failing case? Falling back to old link is probably
            // not the best approach
            return Promise.all(
                assets.map(asset => fetch(asset)
                    .then(resp => resp.blob())
                    .then(blob => toDataUrl(blob))
                    .catch(() => asset)
                )
            );
        }
    }

    private resolveFullRequestUrl(forAsset: string) {
        const testLink = document.createElement('a');
        testLink.href = forAsset;
        return testLink.href;
    }
}