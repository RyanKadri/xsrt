import { LoggingService, Recording, SnapshotChunk } from "@xsrt/common";
import { RecordingSchema, RouteImplementation, IServerConfig } from "@xsrt/common-backend";
import { injectable, inject } from "inversify";
import { thumbnailEndpointMetadata } from "../../route-metadata/thumbnail-endpoint-metadata";
import { ThumbnailCompiler } from "../compiler/to-image";
import { DecoratorConfig } from "../../decorator-server-config";
import Axios from "axios";

type ThumbnailEndpointType = RouteImplementation<typeof thumbnailEndpointMetadata>;

@injectable()
export class ThumbnailEndpoint implements ThumbnailEndpointType {
    constructor(
        private thumbnailCompiler: ThumbnailCompiler,
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
