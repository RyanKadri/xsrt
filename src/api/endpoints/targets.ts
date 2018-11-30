import { Router, Request, Response } from 'express';
import { RouteHandler } from '../../common/server/express-server';
import { injectable } from 'inversify';
import { Target } from '../../common/db/targets';

@injectable()
export class TargetRouteHandler implements RouteHandler {

    constructor() {}

    readonly base = "/api";

    buildRouter() {
        const router = Router();

        router.route('/targets')
            .get(this.fetchTargets)
            .post(this.createTarget)

        router.route('/targets/:targetId')
            .get(this.fetchSingleTarget)
            .delete(this.deleteSingleTarget)

        return router;
    }

    private fetchTargets = (_: Request, resp: Response) => {
        Target.find({}, (err, data) => {
            return err
                ? resp.json({ error: err })
                : resp.json( data )
        });
    }

    private createTarget = (req: Request, resp: Response) => {
        const recording = new Target(req.body);
        recording.save((err, data) => {
            if(err) {
                resp.json({ error: err })
            } else {
                resp.json( data )
            }
        })
    }

    private fetchSingleTarget = (req: Request, resp: Response) => {
        Target.findById(req.params.targetId, (err, data) => {
            return err
                ? resp.json({ error: err })
                : resp.json(data)
        });
    }

    private deleteSingleTarget = (req: Request, resp: Response) => {
        Target.findByIdAndDelete(req.params.targetId, (err, data) => {
            return err
                ? resp.json({ error: err })
                : resp.json(data);
        })
    }
}