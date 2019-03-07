import { injectable } from "inversify";

@injectable()
export class AssetFallbackService {
    fallback(fullUrl: string, _: string) {
        return fullUrl;
    }

    // TODO - Is there any way we can (or want to) support a client-side asset-fetching pattern?
    // private fetchOnClient(asset: string) {
    //     return this.axios.get(asset, { responseType: "blob" })
    //         .then(resp => toDataUrl(resp.data))
    //         .catch(() => asset);
    // }
}
