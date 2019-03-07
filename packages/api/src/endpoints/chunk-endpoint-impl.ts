import { chunkEndpointMetadata, RecordingChunk } from "@xsrt/common";
import { Chunk, errorNotFound, RouteImplementation } from "@xsrt/common-backend";
import { injectable } from "inversify";
import { DecoratorQueueService } from "../../../common-backend/src/queues/decorator-queue-service";

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
            const test = { inputs: {}, ...(res.toObject() as RecordingChunk) };
            return test;
        } else {
            return errorNotFound(`Could not find chunk ${chunkId }`);
        }
    });
}
