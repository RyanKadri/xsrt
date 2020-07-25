import { inject, injectable } from "inversify";
import { Connection, Repository } from "typeorm";
import { ElasticService, initSnapshotQueueInfo, recordingRepo, elasticQueueInfo } from "../../../common-backend/src";
import { ChunkEntity, DBConnectionSymbol, LoggingService, RecordedNavigationEvent, RecordingElasticRep, RecordingEntity } from "../../../common/src";
import { ChunkId, DecoratorConsumer } from "../services/mq-consumer-service";

@injectable()
export class ElasticConsumer implements DecoratorConsumer<ChunkId> {

  readonly topic = elasticQueueInfo;
  private chunkRepo: Repository<ChunkEntity>;

  constructor(
    private elasticService: ElasticService,
    private logger: LoggingService,
    @inject(DBConnectionSymbol) connection: Connection
  ) {
    this.chunkRepo = connection.getRepository(ChunkEntity);
  }

  async handle({ uuid }: ChunkId) {
    const client = this.elasticService.client;

    const chunk = await this.chunkRepo.findOne({ where: { uuid }, relations: ["recording", "recording.target" ] });
    if (!chunk) {
      throw new Error(`Could not find chunk with id: ${uuid}`);
    }

    const oldDocs = (await client.search({
      index: recordingRepo.index,
      type: recordingRepo.type,
      body: {
        query: {
          match: {
            _id: chunk.recording.uuid
          }
        }
      }
    })).body.hits.hits;

    if (oldDocs.length > 1) {
      throw new Error(`Expected at most 1 Elastic document for chunk ${uuid} but got ${oldDocs.length}`);
    }

    let recording: RecordingEntity | undefined;
    let oldDoc: RecordingElasticRep | undefined;
    if (oldDocs.length === 0) {
      if (!chunk.recording) {
        throw new Error(`Could not find recording associated with chunk: ${chunk.uuid}`);
      } else {
        recording = chunk.recording;
      }
    } else {
      oldDoc = oldDocs.length > 0 ? oldDocs[0]._source : undefined;
    }
    const mergedDoc = this.mergeChunkDocs(chunk, recording, oldDoc);

    await client.update({
      index: recordingRepo.index,
      type: recordingRepo.type,
      id: mergedDoc.recording,
      body: {
        doc: mergedDoc,
        doc_as_upsert: true
      }
    });
    this.logger.info(`Updated document for chunk ${chunk.uuid}`);

    if (chunk.chunkType === "snapshot" && chunk.initChunk) {
      return {
        queue: initSnapshotQueueInfo,
        payload: chunk
      };
    } else {
      return;
    }
  }

  private mergeChunkDocs(
    chunk: ChunkEntity, recording?: RecordingEntity, oldDoc?: RecordingElasticRep
  ): RecordingElasticRep {
    const oldUrls = oldDoc
      ? oldDoc.urls
      : [];

    const navigations = ((chunk.inputs || {})["soft-navigate"] || []) as RecordedNavigationEvent[];
    const newUrls = oldUrls.concat(navigations.map(nav => nav.url));
    if (chunk.chunkType === "snapshot") {
      newUrls.unshift(chunk.snapshot.documentMetadata.url.path);
    }

    const userAgent = oldDoc
      ? oldDoc.userAgent
      : recording!.uaDetails.browser.name;
    return {
      recording: oldDoc ? oldDoc.recording : chunk.recording.uuid,
      urls: newUrls,
      start: oldDoc ? oldDoc.start : recording!.startTime.getTime(),
      userAgent,
      site: oldDoc ? oldDoc.site : recording!.target.customerId
    };
  }
}
