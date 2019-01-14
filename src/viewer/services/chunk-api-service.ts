import { inject, injectable } from "inversify";
import { chunkApiSymbol, chunkEndpointMetadata } from "../../api/endpoints/chunk-endpoint-metadata";
import { EndpointApi } from "../../common/server/route-types";

@injectable()
export class ChunkApiService {

    /* istanbul ignore next */
    constructor(
        @inject(chunkApiSymbol) private chunkApi: EndpointApi<typeof chunkEndpointMetadata>
    ) { }

    /* istanbul ignore next */
    fetchChunk(chunkId: string) {
        return this.chunkApi.fetchChunk({ chunkId });
    }
}
