import { Request, Response, Router } from 'express';
import { injectable } from 'inversify';
import { SiteTarget, Target } from '../../common/db/targets';
import { RouteHandler } from '../../common/server/express-server';

@injectable()
export class TargetRouteHandler implements RouteHandler {

    constructor() {}

    readonly base = "/api";

    decorateRouter(router: Router) {
        router.route('/targets')
            .get(this.fetchTargets)
            .post(this.createTarget)

        router.route('/targets/:targetId')
            .get(this.fetchSingleTarget)
            .delete(this.deleteSingleTarget)
    }

    private fetchTargets = (_: Request, resp: Response) => {
        Target.find({}, (err, data) => {
            return err
                ? resp.json({ error: err })
                : resp.json( data )
        });
    }

    private createTarget = (req: Request, resp: Response) => {
        const target: Partial<SiteTarget> = {
            ...req.body
        }
        if(target.identifiedBy === 'host' && !req.body.url) {
            target.url = target.identifier;
        }
        const recording = new Target(target);
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