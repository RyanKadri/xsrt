import { chunkEndpointMetadata, DBConnectionSymbol, DiffChunk, SnapshotChunk, RecordingChunk, ChunkEntity } from "../../../common/src";
import { DecoratorQueueService, errorNotFound, RouteImplementation } from "../../../common-backend/src";
import { inject, injectable } from "inversify";
import { Connection, Repository } from "typeorm";

type ChunkEndpointType = RouteImplementation<typeof chunkEndpointMetadata>;

@injectable()
export class ChunkEndpoint implements ChunkEndpointType {

  private chunkRepo: Repository<ChunkEntity>;

  constructor(
    private queueService: DecoratorQueueService,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.chunkRepo = connection.getRepository(ChunkEntity)
  }

  createChunk: ChunkEndpointType["createChunk"] = (async ({ chunk }) => {
    const savedChunk = await this.chunkRepo.save(chunk as ChunkEntity);
    this.queueService.postChunk(savedChunk as RecordingChunk);
    return { id: savedChunk.id };
  });

  fetchChunk: ChunkEndpointType["fetchChunk"] = (async ({ chunkId }) => {
    const res = await this.chunkRepo.findOne(chunkId);
    if (res) {
      return res as SnapshotChunk | DiffChunk;
    } else {
      return errorNotFound(`Could not find chunk ${chunkId}`);
    }
  });
}
