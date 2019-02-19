import { LoggingService, Recording, recordingEndpoint, UADetails, Without } from "@xsrt/common";
import { errorInvalidCommand, errorNotFound, IServerConfig, RecordingSchema, RouteImplementation, Target } from "@xsrt/common-backend";
import Axios from "axios";
import { inject, injectable } from "inversify";
import * as parser from "ua-parser-js";
import { ApiServerConfig } from "../api-server-conf";

const defaultNumRecordings = 15;
type RecordingEndpointType = RouteImplementation<typeof recordingEndpoint>;

@injectable()
export class RecordingEndpoint implements RecordingEndpointType {

    constructor(
        private logger: LoggingService,
        @inject(IServerConfig) private config: ApiServerConfig
    ) {}

    fetchRecording: RecordingEndpointType["fetchRecording"] = async ({ recordingId }) => {
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
    deleteRecording: RecordingEndpointType["deleteRecording"] = async ({ recordingId }) => {
        const data = await RecordingSchema.findByIdAndDelete(recordingId);
        if (data) {
            return data.toObject();
        } else {
            return errorNotFound(`Recording ${recordingId} does not exist`);
        }
    }
    patchRecording: RecordingEndpointType["patchRecording"] = async ({ patchData, recordingId }) => {
        if (patchData.finalized && patchData.metadata) {
            Axios.post(`${this.config.decorateUrl}/api/thumbnails/${recordingId}`, { })
                .catch(e => this.logger.error(e));

            const recording = await RecordingSchema.findByIdAndUpdate(recordingId, { $set: {
                finalized: true,
                "metadata.duration": patchData.metadata.duration
            }});
            if (recording) {
                return { success: true };
            } else {
                return errorNotFound(`Recording ${recordingId} does not exist`);
            }
        } else {
            return errorInvalidCommand("Unknown command" );
        }
    }
    filterRecordings: RecordingEndpointType["filterRecordings"] = async ({ site: siteId }) => {
        const sites = await RecordingSchema.find(
            { "metadata.site": siteId, finalized: true },
            { metadata: 1, thumbnail: 1 })
        .sort({ "metadata.startTime": -1 })
        .limit(defaultNumRecordings);
        return sites.map(site => site.toObject());
    }
    createRecording: RecordingEndpointType["createRecording"] = async ({ recording: bodyData, userAgent }) => {
        const ua = new parser.UAParser(userAgent || "");

        const site = await Target.findById(bodyData.site);
        if (!site) {
            return errorNotFound(`Site ${bodyData.site} does not exist`);
        }
        const uaDetails = extractUADetails(ua);
        const recordingData: Without<Recording, "_id"> = {
            metadata: { site: site._id, startTime: bodyData.startTime, duration: 0, uaDetails },
            chunks: []
        };
        const recording = new RecordingSchema(recordingData);
        const res = await recording.save();
        return { _id: res._id };
    }
    deleteMany: RecordingEndpointType["deleteMany"] = async ({ deleteRequest }) => {
        if (deleteRequest.ids) {
            await RecordingSchema.deleteMany({ _id: { $in: deleteRequest.ids } }).exec();
            return { success: true };
        } else {
            return errorInvalidCommand(`Unsure how to process this deletion request`);
        }
    }
}

const extractUADetails = (ua: any): UADetails => {
    return {
        browser: ua.getBrowser(),
        os: ua.getOS(),
        device: ua.getDevice(),
    };
};
