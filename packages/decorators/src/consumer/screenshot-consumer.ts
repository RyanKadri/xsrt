import { RecordingSchema } from "@xsrt/common-backend";
import { injectable } from "inversify";
import { ThumbnailCompiler } from "../compile-thumbnail/compiler/to-image";
import { DecoratorConsumer } from "../services/queue-consumer-service";

@injectable()
export class ScreenshotConsumer implements DecoratorConsumer<{ id: string}> {
    readonly topic = "FinalizedRecordings";

    constructor(
        private thumbnailCompiler: ThumbnailCompiler
    ) { }

    handle = async ({id}: {id: string}) => {
        const path = await this.thumbnailCompiler.createThumbnail(id);
        await RecordingSchema.findByIdAndUpdate(id, { $set: { thumbnail: path } });
    }

}
