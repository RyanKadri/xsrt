import { injectable, inject } from "inversify";
import Axios from "axios";
import { toDataUrl } from "../utils/utils";
import { ScraperConfigToken, ScraperConfig } from "../scraper-config,";

@injectable()
export class AssetResolver {

    constructor(
        @inject(ScraperConfigToken) private config: ScraperConfig
    ) {}

    async resolveAssets(assets: string[]): Promise<string[]> {
        try {
            const requestUrls = assets.map(asset => this.resolveFullRequestUrl(asset));
            const res = await Axios.post(`${this.config.backendUrl}/api/proxy`, { urls: requestUrls });
            return res.data.assets.map(asset => `/api/proxy/${asset}`);
        } catch (e) {
            return Promise.all(
                assets.map(asset => fetch(asset)
                    .then(resp => resp.blob())
                    .then(blob => toDataUrl(blob))
                    .catch(() => asset) //TODO - How do we want to handle this case? Falling back to old link is probably not the
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