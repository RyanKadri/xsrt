import { LoggingService, SnapshotChunk } from "@xsrt/common";
import { RecordingSchema, RouteImplementation, Chunk, errorNotFound } from "@xsrt/common-backend";
import { injectable } from "inversify";
import { thumbnailEndpointMetadata } from "../../route-metadata/thumbnail-endpoint-metadata";

type ThumbnailEndpointType = RouteImplementation<typeof thumbnailEndpointMetadata>;

@injectable()
export class ThumbnailEndpoint implements ThumbnailEndpointType {
    constructor(
        private logger: LoggingService,
    ) {}

    getThumbnailData: ThumbnailEndpointType["getThumbnailData"] = async ({ chunkId }) => {
        const chunkDoc = await Chunk.findById(chunkId);
        if (!chunkDoc) {
            return errorNotFound(`Could not find chunk ${chunkId}`);
        }
        return chunkDoc.toObject() as SnapshotChunk;
    }

    deleteThumbnail: ThumbnailEndpointType["deleteThumbnail"] = async ({ recordingId }) => {
        this.logger.info(`Deleting thumbnail for recording: ${recordingId}`);
        // TODO - Actually remove thumbnail
        await RecordingSchema.findByIdAndUpdate(recordingId, { $set: { thumbnail: null } });
        return { success: true };
    }

}
