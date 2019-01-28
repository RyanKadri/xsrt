import { Chunk, chunkEndpointMetadata, errorNotFound, RecordingChunk, RecordingSchema, RouteImplementation } from "@xsrt/common";
import { injectable } from "inversify";

type ChunkEndpointType = RouteImplementation<typeof chunkEndpointMetadata>;

@injectable()
export class ChunkEndpoint implements ChunkEndpointType {
    createChunk: ChunkEndpointType["createChunk"] = (async ({ chunk, recordingId }) => {
        const savedChunk = await new Chunk(chunk).save();
        const doc = await RecordingSchema.findByIdAndUpdate(recordingId, {
            $push: { chunks: savedChunk._id }
        });
        if (!doc) {
            return errorNotFound(`Could not find recording ${recordingId}`);
        } else {
            return { _id: savedChunk!._id };
        }
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
