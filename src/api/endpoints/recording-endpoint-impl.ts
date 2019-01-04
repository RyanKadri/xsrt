import Axios from 'axios';
import * as parser from 'ua-parser-js';
import { Recording as RecordingSchema } from '../../common/db/recording';
import { NewSiteTarget, Target } from '../../common/db/targets';
import { Without } from '../../common/utils/type-utils';
import { Recording, UADetails } from '../../scraper/types/types';
import { multiRecordingMetadata, recordingMultiDeleteMetadata, singleRecordingMetadata } from './recordings-endpoint-metadata';
import { ErrorResponse, implement, SuccessResponse } from './route';

export const singleRecordingImpl = implement(singleRecordingMetadata, {
    get: async ({ recordingId }) => { 
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
        return new SuccessResponse(recordings[0])
    },
    delete: async ({ recordingId }) => {
        const data = await RecordingSchema.findByIdAndDelete(recordingId)
        if(data) {
            return new SuccessResponse(data.toObject());
        } else {
            return new ErrorResponse(404, `Recording ${recordingId} does not exist`);
        }
    },
    patch: async ({ patchData, recordingId, config }) => {
        if(patchData.finalized && patchData.metadata) {
            Axios.post(`${config.decorateUrl}/decorate/thumbnails`, { recordingId })
                .catch(e => console.error(e));

            const recording = await RecordingSchema.findByIdAndUpdate(recordingId, { $set: {
                finalized: true,
                'metadata.duration': patchData.metadata.duration
            }})
            if(recording) {
                return new SuccessResponse({ success: true })
            } else {
                return new ErrorResponse(404, `Recording ${recordingId} does not exist`);
            }
        } else {
            return new ErrorResponse(400, 'Unknown command' );
        }
    }
})

const extractUADetails = (ua: any): UADetails => {
    return {
        browser: ua.getBrowser(),
        os: ua.getOS(),
        device: ua.getDevice(),
    }
}

export const multiRecordingEndpointImpl = implement(multiRecordingMetadata, {
    get: async ({ site }) => {
        const res = await RecordingSchema.find(
            { 'metadata.site': site, finalized: true },
            { metadata: 1, thumbnail: 1 })
        .sort({ 'metadata.startTime': -1 })
        .limit(15)
        return new SuccessResponse(res);
    },
    post: async ({ recording: bodyData, userAgent }) => {
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
        return new SuccessResponse({ _id: res._id })
    }
})

export const recordingMultiDeleteImpl = implement(recordingMultiDeleteMetadata, {
    post: async ({ deleteRequest }) => {
        if(deleteRequest.ids) {
            const res = await RecordingSchema.deleteMany({ _id: { $in: deleteRequest.ids } }).exec()
            return new SuccessResponse({ success: res })
        } else {
            return new ErrorResponse(400, `Unsure how to process this deletion request`);
        }
    }
})