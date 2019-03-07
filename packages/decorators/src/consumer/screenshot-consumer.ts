import { initSnapshotQueue, RecordingSchema, Chunk } from "@xsrt/common-backend";
import { injectable } from "inversify";
import { ThumbnailCompiler } from "../compile-thumbnail/compiler/to-image";
import { DecoratorConsumer } from "../services/queue-consumer-service";
import { LoggingService, RecordingChunk } from "../../../common/src";

@injectable()
export class ScreenshotConsumer implements DecoratorConsumer<{ _id: string}> {
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
