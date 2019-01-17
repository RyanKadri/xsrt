import { Recording } from "../../../common/db/recording";
import { RouteImplementation } from "../../../common/server/route-types";
import { LoggingService } from "../../../common/utils/log-service";
import { ThumbnailCompiler } from "../compiler/to-image";
import { thumbnailEndpointMetadata } from "./thumbnail-endpoint-metadata";

type ThumbnailEndpointType = RouteImplementation<typeof thumbnailEndpointMetadata>;

export class ThumbnailEndpoint implements ThumbnailEndpointType {
    constructor(
        private thumbnailCompiler: ThumbnailCompiler,
        private logger: LoggingService
    ) {}

    compileThumbnail: ThumbnailEndpointType["compileThumbnail"] = async ({ recordingId }) => {
        const path = await this.thumbnailCompiler.createThumbnail(recordingId);
        await Recording.findByIdAndUpdate(recordingId, { $set: { thumbnail: path } });
        return { success: true };
    }

    deleteThumbnail: ThumbnailEndpointType["deleteThumbnail"] = async ({ recordingId }) => {
        this.logger.info(`Deleting thumbnail for recording: ${recordingId}`);
        // TODO - Actually remove thumbnail
        await Recording.findByIdAndUpdate(recordingId, { $set: { thumbnail: null } });
        return { success: true };
    }

}
