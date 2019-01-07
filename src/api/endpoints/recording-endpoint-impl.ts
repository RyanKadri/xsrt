import Axios from 'axios';
import * as parser from 'ua-parser-js';
import { Recording as RecordingSchema } from '../../common/db/recording';
import { NewSiteTarget, Target } from '../../common/db/targets';
import { Without } from '../../common/utils/type-utils';
import { Recording, UADetails } from '../../scraper/types/types';
import { recordingEndpoint } from './recordings-endpoint-metadata';
import { errorInvalidCommand, errorNotFound, implement, RouteImplementation } from './route';

export const recordingEndpointImpl = implement(recordingEndpoint, {
    async fetchRecording({ recordingId }) { 
        const recordings: Recording[] = await RecordingSchema.aggregate([ 
            { $match: { "_id": recordingId }},
            //{ $unwind: "$chunks" },
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
    },
    async deleteRecording({ recordingId }) {
        const data = await RecordingSchema.findByIdAndDelete(recordingId)
        if(data) {
            return data.toObject();
        } else {
            return errorNotFound(`Recording ${recordingId} does not exist`);
        }
    },
    async patchRecording({ patchData, recordingId, config }) {
        if(patchData.finalized && patchData.metadata) {
            Axios.post(`${config.decorateUrl}/decorate/thumbnails`, { recordingId })
                .catch(e => console.error(e));

            const recording = await RecordingSchema.findByIdAndUpdate(recordingId, { $set: {
                finalized: true,
                'metadata.duration': patchData.metadata.duration
            }})
            if(recording) {
                return { success: true }
            } else {
                return errorNotFound(`Recording ${recordingId} does not exist`);
            }
        } else {
            return errorInvalidCommand('Unknown command' );
        }
    },
    async filterRecordings({ site }) {
        const res = await RecordingSchema.find(
            { 'metadata.site': site, finalized: true },
            { metadata: 1, thumbnail: 1 })
        .sort({ 'metadata.startTime': -1 })
        .limit(15)
        return res.map(res => res.toObject());
    },
    async createRecording({ recording: bodyData, userAgent }) {
        const host = bodyData.url.hostname;
        const ua = new parser.UAParser(userAgent || "");

        const existingSite = await Target.findOne({ identifiedBy: 'host', identifier: host });
        let site = existingSite;
        if(!site) {
            const newTarget: NewSiteTarget = { name: host, identifiedBy: 'host', identifier: host, url: host };
            site = await new Target(newTarget).save()
        }
        const uaDetails = extractUADetails(ua)
        const recordingData: Without<Recording, "_id"> = { 
            metadata: { site: site._id, startTime: bodyData.startTime, duration: 0, uaDetails },
            chunks: []
        };
        const recording = new RecordingSchema(recordingData);
        const res = await recording.save();
        return { _id: res._id };
    },
    async deleteMany({ deleteRequest }) {
        if(deleteRequest.ids) {
            await RecordingSchema.deleteMany({ _id: { $in: deleteRequest.ids } }).exec()
            return { success: true }
        } else {
            return errorInvalidCommand(`Unsure how to process this deletion request`);
        }
    }
} as RouteImplementation<typeof recordingEndpoint>)

const extractUADetails = (ua: any): UADetails => {
    return {
        browser: ua.getBrowser(),
        os: ua.getOS(),
        device: ua.getDevice(),
    }
}
