import { Request, Response, Router } from "express";
import { injectable } from "inversify";
import { Chunk } from "../../common/db/chunk";
import { Recording } from "../../common/db/recording";
import { RouteHandler } from "../../common/server/express-server";
import { RecordingChunk } from "../../scraper/types/types";

@injectable()
export class ChunkEndpoint implements RouteHandler {

    constructor(
    ){ }

    readonly base = '/api';

    decorateRouter(router: Router) {
        router.route('/recordings/:recordingId/chunks')
            .post(this.createChunk);

        router.route('/chunks/:chunkId')
            .get(this.fetchChunk);
    }

    createChunk = async (req: Request, resp: Response) => {
        const recordingId = req.params.recordingId;
        const chunkData: RecordingChunk = req.body;
        try {
            const savedChunk = await new Chunk(chunkData).save();
            const doc = await Recording.findByIdAndUpdate(recordingId, { 
                $push: { chunks: savedChunk._id } 
            });
            if(!doc) {
                resp.status(404).json({ error: `Could not find recording ${recordingId}` })
            } else {
                resp.json({ _id: savedChunk!._id })
            }
        } catch(e) {
            resp.status(500).json({ error: true })
        }
    }

    fetchChunk = async (req: Request, resp: Response) => {
        try {
            const res = await Chunk.findById(req.params.chunkId)
            if(res) {
                resp.json({ inputs: {}, ...res.toObject() });
            } else {
                resp.status(404).json({ error: `Could not find chunk ${req.params.chunkId }`})
            }
        } catch(e) {
            resp.json({ error: e })
        }
    }

}