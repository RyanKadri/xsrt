import { Recording } from '../../common/db/recording';
import { Router, Request, Response } from 'express';
import { RouteHandler } from '@common/server/express-server';
import { injectable } from 'inversify';
import axios from 'axios';
import { ApiServerConfig } from '../api-server-conf';

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

    private createRecording = (req: Request, resp: Response) => {
        const recording = new Recording(req.body);
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