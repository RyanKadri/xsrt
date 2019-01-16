import { Chunk } from "../../common/db/chunk";
import { Recording } from "../../common/db/recording";
import { errorNotFound } from "../../common/server/request-handler";
import { RouteImplementation } from "../../common/server/route-types";
import { RecordingChunk } from "../../scraper/types/types";
import { chunkEndpointMetadata } from "./chunk-endpoint-metadata";

type ChunkEndpointType = RouteImplementation<typeof chunkEndpointMetadata>;

export class ChunkEndpoint implements ChunkEndpointType {
    createChunk: ChunkEndpointType["createChunk"] = (async ({ chunk, recordingId }) => {
        const savedChunk = await new Chunk(chunk).save();
        const doc = await Recording.findByIdAndUpdate(recordingId, {
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
