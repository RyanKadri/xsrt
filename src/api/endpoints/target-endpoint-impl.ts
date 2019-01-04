import { Target } from '../../common/db/targets';
import { implement } from './route';
import { mutliTargetMetadata, singleTargetMetadata } from './target-endpoint-metadata';

export const singleTargetImpl = implement(singleTargetMetadata, {
    get: async ({ targetId }) => {
        const target = await Target.findById(targetId);
        return target;
    },
    delete: async ({ targetId }) => {
        const res = await Target.findByIdAndDelete(targetId);
        return res;
    }
})

export const multiTargetImpl = implement(mutliTargetMetadata, {
    get: async () => {
        const res = await Target.find({});
        return res;
    },
    post: async ({ target }) => {
        if(target.identifiedBy === 'host' && !target.url) {
            target.url = target.identifier;
        }
        const recording = new Target(target);
        const data = await recording.save();
        return data;
    }
})