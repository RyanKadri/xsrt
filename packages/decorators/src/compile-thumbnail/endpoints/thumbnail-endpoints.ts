import { LoggingService, Recording, SnapshotChunk } from "@xsrt/common";
import { IServerConfig, RecordingSchema, RouteImplementation } from "@xsrt/common-backend";
import Axios from "axios";
import { inject, injectable } from "inversify";
import { DecoratorConfig } from "../../decorator-server-config";
import { thumbnailEndpointMetadata } from "../../route-metadata/thumbnail-endpoint-metadata";

type ThumbnailEndpointType = RouteImplementation<typeof thumbnailEndpointMetadata>;

@injectable()
export class ThumbnailEndpoint implements ThumbnailEndpointType {
    constructor(
        private logger: LoggingService,
        @inject(IServerConfig) private config: Pick<DecoratorConfig, "recordingHost">
    ) {}

    getThumbnailData: ThumbnailEndpointType["getThumbnailData"] = async ({ recordingId }) => {
        const data: Recording = await Axios.get(`${this.config.recordingHost}/api/recordings/${recordingId}`)
            .then(resp => resp.data);
        const chunkId = data.chunks
            .filter(chunk => chunk.type === "snapshot")
            .sort((a, b) => a.metadata.startTime - b.metadata.startTime)[0]._id;
        const initChunk: SnapshotChunk = await Axios.get(`${this.config.recordingHost}/api/chunks/${chunkId}`)
            .then(resp => resp.data);
        return initChunk;
    }

    deleteThumbnail: ThumbnailEndpointType["deleteThumbnail"] = async ({ recordingId }) => {
        this.logger.info(`Deleting thumbnail for recording: ${recordingId}`);
        // TODO - Actually remove thumbnail
        await RecordingSchema.findByIdAndUpdate(recordingId, { $set: { thumbnail: null } });
        return { success: true };
    }

}
