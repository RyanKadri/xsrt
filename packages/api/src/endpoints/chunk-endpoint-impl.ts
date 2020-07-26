import { chunkEndpointMetadata, DBConnectionSymbol, DiffChunk, SnapshotChunk, RecordingChunk, ChunkEntity, RecordingEntity } from "../../../common/src";
import { errorNotFound, RouteImplementation, QueueSender, IChunkSender, rawChunkQueueInfo, AssetResolver } from "../../../common-backend/src";
import { inject, injectable } from "inversify";
import { Connection, Repository } from "typeorm";
import { v4 as uuid } from "uuid";

type ChunkEndpointType = RouteImplementation<typeof chunkEndpointMetadata>;

@injectable()
export class ChunkEndpoint implements ChunkEndpointType {

  private chunkRepo: Repository<ChunkEntity>;
  private recordingRepo: Repository<RecordingEntity>;

  constructor(
    @inject(IChunkSender) private queueService: QueueSender<RecordingChunk>,
    private assetResolver: AssetResolver,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.chunkRepo = connection.getRepository(ChunkEntity);
    this.recordingRepo = connection.getRepository(RecordingEntity);
  }

  createChunk: ChunkEndpointType["createChunk"] = (async ({ chunk, recordingId, userAgent }) => {
    const recording = await this.recordingRepo.findOne({ where: { uuid: recordingId }})
    const chunkUuid = uuid();

    // This intentionally is allowed to finish after the main request because chunks may have many assets
    // and this could be a slow process. Should not slow down the client.
    // TODO - Potentially move this to a queueing approach?
    this.assetResolver.resolveAssets(chunk.assets, userAgent)
      .then(async assets => {
        const savedChunk = await this.chunkRepo.save({
          ...chunk,
          uuid: chunkUuid,
          recording: recording,
          assets,
          startTime: new Date(chunk.startTime),
          endTime: new Date(chunk.endTime)
        });
        this.queueService.post({
          ...savedChunk,
          startTime: savedChunk.startTime.getTime(),
          endTime: savedChunk.endTime.getTime()
        } as RecordingChunk, rawChunkQueueInfo);
      });

    return { uuid: chunkUuid };
  });

  fetchChunk: ChunkEndpointType["fetchChunk"] = (async ({ chunkId }) => {
    const res = await this.chunkRepo.findOne({ where: { uuid: chunkId }, relations: ["assets"] });
    if (res) {
      return {
        ...res,
        startTime: res.startTime.getTime(),
        endTime: res.endTime.getTime()
      } as SnapshotChunk | DiffChunk;
    } else {
      return errorNotFound(`Could not find chunk ${chunkId}`);
    }
  });
}
