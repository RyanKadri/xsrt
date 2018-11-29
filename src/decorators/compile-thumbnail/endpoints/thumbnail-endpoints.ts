import { Router, Request, Response } from "express";
import { RouteHandler } from "../../../common/server/express-server";
import { injectable } from "inversify";
import { Recording } from "../../../common/db/recording";
import { ThumbnailCompiler } from "../compiler/to-image";

@injectable()
export class ThumbnailRouteHandler implements RouteHandler {
    
    constructor(
        private thumbnailCompiler: ThumbnailCompiler
    ) {}
    readonly base = "/decorate";
    
    buildRouter() {
        const router = Router();

        router.route('/thumbnails')
            .post(this.compileThumbnail);

        router.route('/thumbnails/:recordingId')
            .delete(this.deleteThumbnail);

        return router;
    }

    private compileThumbnail = async (req: Request, resp: Response) => {
        const recordingId = req.body.recordingId;
        try {
            const path = await this.thumbnailCompiler.createThumbnail(recordingId);
            await Recording.findByIdAndUpdate(recordingId, { '$set': { 'thumbnail': path } });
            resp.json({ success: true })
        } catch (e) {
            resp.json({ error: e.message });
        }
    }
    
    private deleteThumbnail = (req: Request, resp: Response) => {
        console.log([req,resp])
    }
}

