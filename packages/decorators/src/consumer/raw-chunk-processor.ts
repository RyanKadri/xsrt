import { LoggingService, RecordingChunk } from "@xsrt/common";
import { Chunk, elasticQueue, rawChunkQueue, RecordingSchema } from "@xsrt/common-backend";
import { injectable } from "inversify";
import { AssetResolver } from "../assets/asset-resolver";
import { ChunkId, DecoratorConsumer } from "../services/queue-consumer-service";

@injectable()
export class RawChunkProcessor implements DecoratorConsumer<ChunkId> {

    constructor(
        private resolver: AssetResolver,
        private logger: LoggingService,
    ) { }

    readonly topic = rawChunkQueue.name;

    handle = async ({ _id }: ChunkId) => {
        const chunkDoc = await Chunk.findById(_id);
        if (!chunkDoc) {
            throw new Error(`Tried to find nonexistent chunk ${_id}`);
        }
        const chunk: RecordingChunk = chunkDoc.toObject();
        const assets = await this.resolver.resolveAssets(chunk.assets);
        const withResolvedAssets = {
            ...chunk,
            assets
        };

        Chunk.findByIdAndUpdate(chunk._id, withResolvedAssets, { upsert: true });

        const doc = await RecordingSchema.findByIdAndUpdate(chunk.recording, {
            $push: { chunks: chunk._id },
            $max: { "metadata.duration": chunk.metadata.stopTime }
        });
        if (!doc) {
            this.logger.error(`Tried to add chunk to recording ${chunk.recording} but it did not exist`);
        }
        return {
            queue: elasticQueue.name,
            payload: { _id: chunk }
        };
    }
}
