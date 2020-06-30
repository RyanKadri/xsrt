import { LoggingService, RecordedNavigationEvent, Recording, RecordingChunk, RecordingElasticRep } from "@xsrt/common";
import { Chunk, elasticQueue, ElasticService, initSnapshotQueue, recordingRepo, RecordingSchema } from "@xsrt/common-backend";
import { injectable } from "inversify";
import { ChunkId, DecoratorConsumer } from "../services/queue-consumer-service";

@injectable()
export class ElasticConsumer implements DecoratorConsumer<ChunkId> {

    readonly topic = elasticQueue.name;

    constructor(
        private elasticService: ElasticService,
        private logger: LoggingService
    ) { }

    async handle({ _id }: ChunkId) {
        const client = this.elasticService.client;

        const chunkDoc = await Chunk.findById(_id);
        if (!chunkDoc) {
            throw new Error(`Could not find chunk with id: ${_id}`);
        }

        const chunk: RecordingChunk = chunkDoc.toObject();
        const oldDocs = (await client.search({
            index: recordingRepo.index,
            type: recordingRepo.type,
            body: {
                query: {
                    match: {
                        _id: chunk.recording
                    }
                }
            }
        })).body.hits.hits;

        if (oldDocs.length > 1) {
            throw new Error(`Expected at most 1 Elastic document for chunk ${ _id } but got ${oldDocs.length}`);
        }

        let recording: Recording | undefined;
        let oldDoc: RecordingElasticRep | undefined;
        if (oldDocs.length === 0) {
            const recordingDoc = await RecordingSchema.findById(chunk.recording);
            if (!recordingDoc) {
                throw new Error(`Could not find recording with id: ${ chunk.recording }`);
            } else {
                recording = recordingDoc.toObject();
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
            } });
        this.logger.info(`Updated document for chunk ${chunk._id}`);

        if (chunk.type === "snapshot" && chunk.initChunk) {
            return {
                queue: initSnapshotQueue.name,
                payload: chunk
            };
        } else {
            return;
        }
    }

    private mergeChunkDocs(
        chunk: RecordingChunk, recording?: Recording, oldDoc?: RecordingElasticRep
    ): RecordingElasticRep {
        const oldUrls = oldDoc
            ? oldDoc.urls
            : [recording!.metadata.site];

        const navigations = ((chunk.inputs || {})["soft-navigate"] || []) as RecordedNavigationEvent[];
        const newUrls = oldUrls.concat(navigations.map(nav => nav.url));
        if (chunk.type === "snapshot") {
            newUrls.unshift(chunk.snapshot.documentMetadata.url.path);
        }

        const userAgent = oldDoc
                            ? oldDoc.userAgent
                            : recording!.metadata.uaDetails.browser.name;
        return {
            recording: oldDoc ? oldDoc.recording : chunk.recording,
            urls: newUrls,
            start: oldDoc ? oldDoc.start : recording!.metadata.startTime,
            userAgent,
            site: oldDoc ? oldDoc.site : recording!.metadata.site
        };
    }
}
