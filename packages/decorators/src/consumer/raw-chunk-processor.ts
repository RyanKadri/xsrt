import { ChunkEntity, RecordingEntity, DBConnectionSymbol } from "../../../common/src";
import { elasticQueue, rawChunkQueue } from "../../../common-backend/src";
import { injectable, inject } from "inversify";
import { AssetResolver } from "../assets/asset-resolver";
import { ChunkId, DecoratorConsumer } from "../services/queue-consumer-service";
import { Connection, Repository } from "typeorm";

@injectable()
export class RawChunkProcessor implements DecoratorConsumer<ChunkId> {

  private chunkRepo: Repository<ChunkEntity>;
  private recordingRepo: Repository<RecordingEntity>;

  constructor(
    private resolver: AssetResolver,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.chunkRepo = connection.getRepository(ChunkEntity);
    this.recordingRepo = connection.getRepository(RecordingEntity);
  }

  readonly topic = rawChunkQueue.name;

  handle = async ({ uuid }: ChunkId) => {
    const chunk = await this.chunkRepo.findOne({ where: { uuid }, relations: ["recording"]});
    if (!chunk) {
      throw new Error(`Tried to find nonexistent chunk ${uuid}`);
    }
    const assets = await this.resolver.resolveAssets(chunk.assets.map(asset => asset.origUrl));

    this.chunkRepo.save({
      ...chunk,
      assets: assets.map((asset, i) => ({ ...chunk.assets[i], proxyUrl: asset }))
    });

    const recording = await this.recordingRepo.findOneOrFail({ where: { uuid: chunk.recording.uuid } });
    recording.chunks.push(chunk);
    // const doc = await RecordingSchema.findByIdAndUpdate(chunk.recording, {
    //   $push: { chunks: chunk._id },
    //   $max: { "metadata.duration": chunk.stopTime }
    // });
    // if (!doc) {
    //   this.logger.error(`Tried to add chunk to recording ${chunk.recording} but it did not exist`);
    // }
    return {
      queue: elasticQueue.name,
      payload: { uuid: chunk.uuid }
    };
  }
}
