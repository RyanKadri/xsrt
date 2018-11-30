import { Recording } from '../../common/db/recording';
import { Router, Request, Response } from 'express';
import { RouteHandler } from '@common/server/express-server';
import { injectable } from 'inversify';
import axios from 'axios';
import { ApiServerConfig } from '../api-server-conf';
import { DedupedData } from '@scraper/types/types';
import { Target } from '@common/db/targets';
import { NewSiteTarget } from 'viewer/components/manage-sites/add-site-form';

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

    // TODO - This will probably be inefficient once we have larger numbers of recordings.
    // Not sure if the grouping knows about the slice later on. Might grab everything
    private fetchRecordings = (_: Request, resp: Response) => {
        Recording.aggregate([
            { '$project': { metadata: 1, thumbnail: 1 }},
            { '$sort': { 'metadata.url.hostname': 1, 'metadata.startTime': -1 }},
            { '$group': { '_id': '$metadata.url.hostname', 'docs': { '$push': '$$ROOT'}}},
            { '$project': { 'site': '$_id', 'results': { '$slice': ['$docs', 3]} } } 
        ], (err, data) => {
            return err
                ? resp.json({ error: err })
                : resp.json( data )
        })
    }

    // TODO - Figure out how to do this with transactions
    private createRecording = async (req: Request, resp: Response) => {
        const recordingData: DedupedData = req.body;
        const host = recordingData.metadata.url.hostname;

        const existingSite = await Target.findOne({ identifiedBy: 'host', identifier: host });
        let site = existingSite;
        if(!site) {
            const newTarget: NewSiteTarget = { name: host, identifiedBy: 'host', identifier: host };
            site = await new Target(newTarget).save()
        }
        const recording = new Recording({ ...recordingData, site: site._id });
        recording.save((err, data) => {
            if(err) {
                resp.json({ error: err })
            } else {
                axios.post(`${this.apiConfig.decorateUrl}/decorate/thumbnails`, { recordingId: data._id })
                    .catch(e => console.error(e));
                resp.json( data )
            }
        })
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