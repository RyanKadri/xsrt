import Axios from 'axios';
import { Request, Response, Router } from 'express';
import { injectable } from 'inversify';
import * as parser from 'ua-parser-js';
import { NewSiteTarget } from 'viewer/components/manage-sites/add-site-form';
import { Recording as RecordingSchema } from '../../common/db/recording';
import { Target } from '../../common/db/targets';
import { RouteHandler } from '../../common/server/express-server';
import { DeepPartial, Without } from '../../common/utils/type-utils';
import { LocationMetadata, Recording, UADetails } from '../../scraper/types/types';
import { ApiServerConfig } from '../api-server-conf';

@injectable()
export class RecordingRouteHandler implements RouteHandler {

    constructor(
        private apiConfig: ApiServerConfig
    ) {}

    readonly base = "/api";

    decorateRouter(router: Router) {
        router.route('/recordings')
            .get(this.fetchRecordings)
            .post(this.createRecording)

        router.route('/recordings/:recordingId')
            .get(this.fetchSingleRecording)
            .patch(this.finalizeRecording)
            .delete(this.deleteSingleRecording)
    }

    private fetchRecordings = async (req: Request, resp: Response) => {   
        try{
            const res = await RecordingSchema.find(
                { 'metadata.site': req.query.site, finalized: true },
                { metadata: 1, thumbnail: 1 })
            .sort({ 'metadata.startTime': -1 })
            .limit(15)
            resp.json(res);
        } catch(e){
            resp.status(500).json({error: e})
        }
    }

    // TODO - Figure out how to do this with transactions
    private createRecording = async (req: Request, resp: Response) => {
        const bodyData: CreateRecordingRequest = req.body;
        const host = bodyData.url.hostname;
        const ua = new parser.UAParser(req.headers["user-agent"] || "");

        const existingSite = await Target.findOne({ identifiedBy: 'host', identifier: host });
        let site = existingSite;
        if(!site) {
            const newTarget: NewSiteTarget = { name: host, identifiedBy: 'host', identifier: host, url: host };
            site = await new Target(newTarget).save()
        }
        const uaDetails = this.extractUADetails(ua)
        const recordingData: Without<Recording, "_id"> = { 
            metadata: { site: site._id, startTime: bodyData.startTime, duration: 0, uaDetails },
            chunks: []
        };
        const recording = new RecordingSchema(recordingData);
        recording.save((err, data) => {
            if(err) {
                resp.status(500).json({ error: err }) 
            } else { 
                resp.json({ _id: data._id })
            }
        })
    }

    private finalizeRecording = async (req: Request, resp: Response) => {
        const patchRequest: DeepPartial<Recording> = req.body;
        const recordingId: string = req.params.recordingId;
        if(patchRequest.finalized && patchRequest.metadata) {
            Axios.post(`${this.apiConfig.decorateUrl}/decorate/thumbnails`, { recordingId })
                .catch(e => console.error(e));
            try {
                const recording = await RecordingSchema.findByIdAndUpdate(recordingId, { $set: {
                    finalized: true,
                    'metadata.duration': patchRequest.metadata.duration
                }})
                if(recording) {
                    resp.json({ success: true })
                } else {
                    resp.status(404).json({ error: `Recording ${recordingId} does not exist`})
                }
            } catch(e) {
                resp.status(500).json({ error: e})
            }
        } else {
            resp.status(400).json({ error: 'Unknown command' })
        }
    }

    private extractUADetails(ua: any): UADetails {
        return {
            browser: ua.getBrowser(),
            os: ua.getOS(),
            device: ua.getDevice(),
        }
    }

    private fetchSingleRecording = async (req: Request, resp: Response) => {
        try {
            const recordings: Recording[] = RecordingSchema.aggregate([ 
                { $match: { "_id": req.params.recordingId }},
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
            resp.json(recordings[0])
        } catch(e) {
            resp.status(500).json({ error: e })
        }
    }

    private deleteSingleRecording = (req: Request, resp: Response) => {
        const { recordingId } = req.params;
        RecordingSchema.findByIdAndDelete(recordingId, (err, data) => {
            if(err) {
                resp.status(500).json({ error: err })
            } else if(data) {
                resp.json(data)
            } else {
                resp.status(404).json({ error: `Recording ${recordingId} does not exist` })
            }
        });
    }
}

export interface CreateRecordingRequest {
    url: LocationMetadata;
    startTime: number;

}