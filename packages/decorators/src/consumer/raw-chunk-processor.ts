import { ChunkEntity, RecordingEntity, DBConnectionSymbol, LoggingService } from "../../../common/src";
import { rawChunkQueueInfo, elasticQueueInfo } from "../../../common-backend/src";
import { injectable, inject } from "inversify";
import { ChunkId, DecoratorConsumer } from "../services/mq-consumer-service";
import { Connection, Repository } from "typeorm";

@injectable()
export class RawChunkProcessor implements DecoratorConsumer<ChunkId> {
  readonly topic = rawChunkQueueInfo;

  private chunkRepo: Repository<ChunkEntity>;
  private recordingRepo: Repository<RecordingEntity>;

  constructor(
    private logger: LoggingService,
    @inject(DBConnectionSymbol) connection: Connection,
  ) {
    this.chunkRepo = connection.getRepository(ChunkEntity);
    this.recordingRepo = connection.getRepository(RecordingEntity);
  }

  handle = async ({ uuid }: ChunkId) => {
    const chunk = await this.chunkRepo.findOne({ where: { uuid }, relations: ["recording", "assets"]});
    if (!chunk) {
      throw new Error(`Tried to find nonexistent chunk ${uuid}`);
    }

    const recording = await this.recordingRepo.findOneOrFail({ where: { uuid: chunk.recording.uuid }, relations: ["chunks"] });
    recording.chunks.push(chunk);
    recording.duration = Math.max(recording.duration ?? 0, chunk.endTime.getTime() - recording.startTime.getTime())
    const doc = await this.recordingRepo.save(recording);
    if (!doc) {
      this.logger.error(`Tried to add chunk to recording ${chunk.recording} but it did not exist`);
    }
    return {
      queue: elasticQueueInfo,
      payload: { uuid: chunk.uuid }
    };
  }
}
