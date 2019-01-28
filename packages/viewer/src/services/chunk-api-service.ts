import { chunkApiSymbol, chunkEndpointMetadata, EndpointApi } from "@xsrt/common";
import { inject, injectable } from "inversify";

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
