import { injectable } from "inversify";
import { Recording, Without } from "@xsrt/common";
import { RecordingSchema, ElasticService, recordingRepo } from "@xsrt/common-backend";
import { RecordingFilterParams } from "../endpoints/recording-endpoint-impl";

const defaultNumRecordings = 15;

@injectable()
export class RecordingService {

    constructor(private elasticService: ElasticService) { }

    async fetchRecording(recordingId: string) {
        const recordings: Recording[] = await RecordingSchema.aggregate([
            { $match: { _id: recordingId }},
            // { $unwind: "$chunks" },
            { $lookup: {
                from: "recordingChunks",
                localField: "chunks",
                foreignField: "_id",
                as: "chunks",
            }},
            { $project: {  // TODO - Is there some way I can do a positive projection (type and metadata) in the lookup?
                "chunks.changes": 0,
                "chunks.inputs": 0,
                "chunks.snapshot": 0,
                "chunks.assets": 0
            }}
        ]).exec();
        return recordings[0];
    }

    async deleteRecording(recordingId: string): Promise<Recording | undefined> {
        const recording = await RecordingSchema.findByIdAndDelete(recordingId);
        if (recording) {
            return recording.toObject();
        } else {
            return undefined;
        }
    }

    async filterRecordings({ site }: RecordingFilterParams) {
        const client = this.elasticService.client;
        const elasticRecordings = await client.search({
            ...recordingRepo,
            body: {
                query: {
                    match: {
                        site
                    }
                }
            }
        });

        const recordings = await RecordingSchema.find(
            { _id: { $in: elasticRecordings.hits.hits.map(hit => hit._id) } },
            { metadata: 1, thumbnail: 1 }
        ).sort({ "metadata.startTime": -1 })
         .limit(defaultNumRecordings);

        return recordings.map(rec => rec.toObject());
    }

    async deleteRecordings(ids: string[]) {
        return await RecordingSchema.deleteMany({ _id: { $in: ids } }).exec();
    }

    async createRecording(recordingData: Without<Recording, "_id">) {
        const recording = new RecordingSchema(recordingData);
        return await recording.save();
    }
}
