import { chunkApiSymbol, chunkEndpointMetadata, EndpointApi } from "../../../common/src";
import { inject, injectable } from "inversify";
import { dataUrlToBlob } from "../../../common-frontend/src";

@injectable()
export class ChunkApiService {

    /* istanbul ignore next */
    constructor(
        @inject(chunkApiSymbol) private chunkApi: EndpointApi<typeof chunkEndpointMetadata>
    ) { }

    /* istanbul ignore next */
    async fetchChunk(chunkId: string) {
        const chunk = await this.chunkApi.fetchChunk({ chunkId });
        return { ...chunk, assets: await Promise.all(chunk.assets.map(dataUrlToBlob)) };
    }
}
