import { chunkEndpointMetadata, RecordingChunk } from "@xsrt/common";
import { Chunk, DecoratorQueueService, errorNotFound, RouteImplementation } from "@xsrt/common-backend";
import { injectable } from "inversify";

type ChunkEndpointType = RouteImplementation<typeof chunkEndpointMetadata>;

@injectable()
export class ChunkEndpoint implements ChunkEndpointType {

    constructor(
        private queueService: DecoratorQueueService
    ) { }

    createChunk: ChunkEndpointType["createChunk"] = (async ({ chunk }) => {
        const savedChunk = await new Chunk(chunk).save();
        this.queueService.postChunk(savedChunk.toObject());
        return { _id: savedChunk!._id };
    });

    fetchChunk: ChunkEndpointType["fetchChunk"] = (async ({ chunkId }) => {
        const res = await Chunk.findById(chunkId);
        if (res) {
            const test = { ...(res.toObject() as RecordingChunk) };
            return test;
        } else {
            return errorNotFound(`Could not find chunk ${chunkId }`);
        }
    });
}
