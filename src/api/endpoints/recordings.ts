import { Recording } from '../../common/db/recording';
import { Router, Request, Response } from 'express';
import { RouteHandler } from '../../common/server/express-server';
import { injectable } from 'inversify';
import axios from 'axios';
import { ApiServerConfig } from '../api-server-conf';
import { DedupedData } from '../../scraper/types/types';
import { Target } from '../../common/db/targets';
import { NewSiteTarget } from 'viewer/components/manage-sites/add-site-form';
import * as parser from 'ua-parser-js';
import { RecordingData, UADetails } from '../types';

@injectable()
export class RecordingRouteHandler implements RouteHandler {

    constructor(
        private apiConfig: ApiServerConfig
    ) {}

    readonly base = "/api";

    buildRouter() {
        const router = Router();

        router.route('/recordings')
            .get(this.fetchRecordings)
            .post(this.createRecording)

        router.route('/recordings/:recordingId')
            .get(this.fetchSingleRecording)
            .delete(this.deleteSingleRecording)

        return router;
    }

    private fetchRecordings = async (req: Request, resp: Response) => {   
        try{
            const res = await Recording.find(
                { site: req.query.site },
                { metadata: 1, thumbnail: 1 })
            .limit(15)
            resp.json(res);
        } catch(e){
            resp.json({error: e})
        }
    }

    // TODO - Figure out how to do this with transactions
    private createRecording = async (req: Request, resp: Response) => {
        const bodyData: DedupedData = req.body;
        const host = bodyData.metadata.url.hostname;
        const ua = new parser.UAParser(bodyData.metadata.userAgent);

        const existingSite = await Target.findOne({ identifiedBy: 'host', identifier: host });
        let site = existingSite;
        if(!site) {
            const newTarget: NewSiteTarget = { name: host, identifiedBy: 'host', identifier: host, url: host };
            site = await new Target(newTarget).save()
        }
        const extMetadata = { 
            ...bodyData.metadata,
            uaDetails: this.extractUADetails(ua)
        }
        const recordingData: RecordingData = { ...bodyData, site: site._id, metadata: extMetadata };
        const recording = new Recording(recordingData);
        recording.save((err, data) => {
            if(err) {
                resp.json({ error: err })
            } else { 
                axios.post(`${this.apiConfig.decorateUrl}/decorate/thumbnails`, { recordingId: data._id })
                    .catch(e => console.error(e));
                resp.json({ success: true })
            }
        })
    }

    private extractUADetails(ua): UADetails {
        return {
            browser: ua.getBrowser(),
            os: ua.getOS(),
            device: ua.getDevice(),
        }
    }

    private fetchSingleRecording = (req: Request, resp: Response) => {
        Recording.findById(req.params.recordingId, (err, data) => {
            return err
                ? resp.json({ error: err })
                : resp.json(data)
        });
    }

    private deleteSingleRecording = (req: Request, resp: Response) => {
        Recording.findByIdAndDelete(req.params.recordingId, (err, data) => {
            return err
                ? resp.json({ error: err })
                : resp.json(data);
        })
    }
}