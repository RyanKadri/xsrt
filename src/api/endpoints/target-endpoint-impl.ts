import { Target } from '../../common/db/targets';
import { errorNotFound, implement, RouteImplementation } from './route';
import { siteTargetEndpoint } from './target-endpoint-metadata';

export const targetEndpointImpl = implement(siteTargetEndpoint, {
    fetchSiteTarget: async ({ targetId }) => {
        const target = await Target.findById(targetId);
        if(target) {
            return target.toObject();
        } else {
            return errorNotFound(`Target ${targetId} not found`)
        }
    },
    deleteSiteTarget: async ({ targetId }) => {
        const res = await Target.findByIdAndDelete(targetId);
        if(res) {
            return res.toObject();
        } else {
            return errorNotFound(`Target ${targetId} not found`)
        }
    },
    filterTargets: async () => {
        const res = await Target.find({});
        return res.map(doc => doc.toObject());
    },
    createSiteTarget: async ({ target }) => {
        if(target.identifiedBy === 'host' && !target.url) {
            target.url = target.identifier;
        }
        const recording = new Target(target);
        const data = await recording.save();
        return data.toObject();
    }
} as RouteImplementation<typeof siteTargetEndpoint>)