import { chunkEndpointMetadata, DBConnectionSymbol, DiffChunk, SnapshotChunk, RecordingChunk, ChunkEntity, RecordingEntity } from "../../../common/src";
import { DecoratorQueueService, errorNotFound, RouteImplementation } from "../../../common-backend/src";
import { inject, injectable } from "inversify";
import { Connection, Repository } from "typeorm";
import { v4 as uuid } from "uuid";

type ChunkEndpointType = RouteImplementation<typeof chunkEndpointMetadata>;

@injectable()
export class ChunkEndpoint implements ChunkEndpointType {

  private chunkRepo: Repository<ChunkEntity>;
  private recordingRepo: Repository<RecordingEntity>;

  constructor(
    private queueService: DecoratorQueueService,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.chunkRepo = connection.getRepository(ChunkEntity);
    this.recordingRepo = connection.getRepository(RecordingEntity);
  }

  createChunk: ChunkEndpointType["createChunk"] = (async ({ chunk, recordingId }) => {
    const recording = await this.recordingRepo.findOne({ where: { uuid: recordingId }})
    const savedChunk = await this.chunkRepo.save({
      ...chunk,
      uuid: uuid(),
      recording: recording
    });
    this.queueService.postChunk(savedChunk as RecordingChunk);
    return { uuid: savedChunk.uuid };
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
