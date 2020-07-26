import { LoggingService, ChunkEntity, RecordingEntity, DBConnectionSymbol } from "../../../common/src";
import { initSnapshotQueueInfo, IAssetStorageService, AssetStorageService } from "../../../common-backend/src";
import { injectable, inject } from "inversify";
import { ThumbnailCompiler } from "../compile-thumbnail/compiler/to-image";
import { ChunkId, DecoratorConsumer } from "../services/mq-consumer-service";
import { Connection, Repository } from "typeorm";

@injectable()
export class ScreenshotConsumer implements DecoratorConsumer<ChunkId> {
  readonly topic = initSnapshotQueueInfo;

  private chunkRepo: Repository<ChunkEntity>;
  private recordingRepo: Repository<RecordingEntity>;

  constructor(
    private thumbnailCompiler: ThumbnailCompiler,
    private logger: LoggingService,
    @inject(DBConnectionSymbol) connection: Connection,
    @inject(IAssetStorageService) private storageService: AssetStorageService
  ) {
    this.chunkRepo = connection.getRepository(ChunkEntity);
    this.recordingRepo = connection.getRepository(RecordingEntity);
   }

  handle = async ({ uuid }: { uuid: string }) => {
    const chunk = await this.chunkRepo.findOne({ where: { uuid }, relations: ["recording"] });
    if (chunk) {
      if (chunk.chunkType !== "snapshot") {
        this.logger.error("Tried to make a snapshot from a diff chunk");
        return;
      }
      const buffer = await this.thumbnailCompiler.createThumbnail(uuid);

      const fileName = `${uuid}.png`;
      const path = `screenshots/${fileName}`;
      await this.storageService.saveAsset(buffer, path)
      chunk.recording.thumbnailPath = path;
      await this.recordingRepo.save(chunk.recording);
    } else {
      this.logger.error(`Could not find chunk with id: ${uuid}`);
    }
  }

}
