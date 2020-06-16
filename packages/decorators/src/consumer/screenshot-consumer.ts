import { LoggingService, RecordingChunk } from "@xsrt/common";
import { Chunk, initSnapshotQueue, RecordingSchema } from "@xsrt/common-backend";
import { injectable } from "inversify";
import { ThumbnailCompiler } from "../compile-thumbnail/compiler/to-image";
import { ChunkId, DecoratorConsumer } from "../services/queue-consumer-service";

@injectable()
export class ScreenshotConsumer implements DecoratorConsumer<ChunkId> {
    readonly topic = initSnapshotQueue.name;

    constructor(
        private thumbnailCompiler: ThumbnailCompiler,
        private logger: LoggingService
    ) { }

    handle = async ({ _id }: { _id: string }) => {
        const chunk = await Chunk.findById(_id);
        if (chunk) {
            const recChunk: RecordingChunk = chunk.toObject();
            if (recChunk.type !== "snapshot") {
                this.logger.error("Tried to make a snapshot from a diff chunk");
                return;
            }
            const path = await this.thumbnailCompiler.createThumbnail(_id);
            await RecordingSchema.findByIdAndUpdate(recChunk.recording, { $set: { thumbnail: path } });
        } else {
            this.logger.error(`Could not find chunk with id: ${_id}`);
        }
    }

}
