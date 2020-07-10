import { LoggingService, SnapshotChunk, ChunkEntity, RecordingEntity, DBConnectionSymbol } from "../../../../common/src";
import { RouteImplementation, errorNotFound } from "../../../../common-backend/src";
import { injectable, inject } from "inversify";
import { thumbnailEndpointMetadata } from "../../route-metadata/thumbnail-endpoint-metadata";
import { Repository, Connection } from "typeorm";

type ThumbnailEndpointType = RouteImplementation<typeof thumbnailEndpointMetadata>;

@injectable()
export class ThumbnailEndpoint implements ThumbnailEndpointType {

  private chunkRepo: Repository<ChunkEntity>;
  private recordingRepo: Repository<RecordingEntity>;
  constructor(
    private logger: LoggingService,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.chunkRepo = connection.getRepository(ChunkEntity);
    this.recordingRepo = connection.getRepository(RecordingEntity);
   }

  getThumbnailData: ThumbnailEndpointType["getThumbnailData"] = async ({ chunkId }) => {
    const chunk = await this.chunkRepo.findOne({ where: { uuid: chunkId }, relations: ["assets"] });
    if (!chunk) {
      return errorNotFound(`Could not find chunk ${chunkId}`);
    }
    return {
      ...chunk,
      startTime: chunk.startTime.getTime(),
      endTime: chunk.endTime.getTime()
    } as SnapshotChunk;
  }

  deleteThumbnail: ThumbnailEndpointType["deleteThumbnail"] = async ({ recordingId }) => {
    this.logger.info(`Deleting thumbnail for recording: ${recordingId}`);
    // TODO - Actually remove thumbnail
    this.recordingRepo.update(recordingId, { thumbnailPath: null })
    return { success: true };
  }

}
