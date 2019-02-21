import { injectable, inject } from "inversify";
import { AxiosSymbol, ScraperConfigToken, ScraperConfig } from "@xsrt/common";
import { AxiosStatic as Axios } from "axios";
import { toDataUrl } from "../utils/dom-utils";

@injectable()
export class AssetFallbackService {
    constructor(
        @inject(ScraperConfigToken) private config: Pick<ScraperConfig, "clientFetchFallback">,
        @inject(AxiosSymbol) private axios: Axios
    ) { }

    fallback(fullUrl: string, origUrl: string) {
        return this.config.clientFetchFallback
                        ? this.fetchOnClient(origUrl) // Use the client to fetch the original (non-full) URL
                        : fullUrl;
    }

    private fetchOnClient(asset: string) {
        return this.axios.get(asset, { responseType: "blob" })
            .then(resp => toDataUrl(resp.data))
            .catch(() => asset);
    }
}
