import { LoggingService, RecordingSchema, RouteImplementation } from "@xsrt/common";
import { injectable } from "inversify";
import { thumbnailEndpointMetadata } from "../../../../common/src/endpoint/thumbnail-endpoint-metadata";
import { ThumbnailCompiler } from "../compiler/to-image";

type ThumbnailEndpointType = RouteImplementation<typeof thumbnailEndpointMetadata>;

@injectable()
export class ThumbnailEndpoint implements ThumbnailEndpointType {
    constructor(
        private thumbnailCompiler: ThumbnailCompiler,
        private logger: LoggingService
    ) {}

    compileThumbnail: ThumbnailEndpointType["compileThumbnail"] = async ({ recordingId }) => {
        const path = await this.thumbnailCompiler.createThumbnail(recordingId);
        await RecordingSchema.findByIdAndUpdate(recordingId, { $set: { thumbnail: path } });
        return { success: true };
    }

    deleteThumbnail: ThumbnailEndpointType["deleteThumbnail"] = async ({ recordingId }) => {
        this.logger.info(`Deleting thumbnail for recording: ${recordingId}`);
        // TODO - Actually remove thumbnail
        await RecordingSchema.findByIdAndUpdate(recordingId, { $set: { thumbnail: null } });
        return { success: true };
    }

}
