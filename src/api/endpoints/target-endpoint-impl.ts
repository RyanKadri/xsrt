import { Target } from '../../common/db/targets';
import { errorNotFound, implement } from './route';
import { mutliTargetMetadata, singleTargetMetadata } from './target-endpoint-metadata';

export const singleTargetImpl = implement(singleTargetMetadata, {
    get: async ({ targetId }) => {
        const target = await Target.findById(targetId);
        if(target) {
            return target.toObject();
        } else {
            return errorNotFound(`Target ${targetId} not found`)
        }
    },
    delete: async ({ targetId }) => {
        const res = await Target.findByIdAndDelete(targetId);
        if(res) {
            return res.toObject();
        } else {
            return errorNotFound(`Target ${targetId} not found`)
        }
    }
})

export const multiTargetImpl = implement(mutliTargetMetadata, {
    get: async () => {
        const res = await Target.find({});
        return res.map(doc => doc.toObject());
    },
    post: async ({ target }) => {
        if(target.identifiedBy === 'host' && !target.url) {
            target.url = target.identifier;
        }
        const recording = new Target(target);
        const data = await recording.save();
        return data.toObject();
    }
})