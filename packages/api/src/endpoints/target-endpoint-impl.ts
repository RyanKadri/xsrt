import { SiteTarget, siteTargetEndpoint } from "@xsrt/common";
import { errorNotFound, RouteImplementation, Target } from "@xsrt/common-backend";
import { injectable } from "inversify";

type TargetEndpointType = RouteImplementation<typeof siteTargetEndpoint>;

@injectable()
export class TargetEndpoint implements TargetEndpointType {

    fetchSiteTarget: TargetEndpointType["fetchSiteTarget"] = async ({ targetId }) => {
        const target = await Target.findById(targetId);
        if (target) {
            return target.toObject();
        } else {
            return errorNotFound(`Target ${targetId} not found`);
        }
    }

    deleteSiteTarget: TargetEndpointType["deleteSiteTarget"] = async ({ targetId }) => {
        const res = await Target.findByIdAndDelete(targetId);
        if (res) {
            return res.toObject();
        } else {
            return errorNotFound(`Target ${targetId} not found`);
        }
    }

    filterTargets = async () => {
        const res = await Target.aggregate([
            { $lookup: {
                from: "recordings",
                localField: "_id",
                foreignField: "metadata.site",
                as: "recordings"
            } },
            { $project: {
                _id: 1,
                name: 1,
                urls: 1,
                wildcardUrl: 1,
                numRecordings: { $size: { $ifNull: ["$recordings", []] } }
            } }
        ]);
        return res;
    }

    createSiteTarget: TargetEndpointType["createSiteTarget"] = async ({ target }) => {
        const toCreate = new Target(target);
        const created: SiteTarget = (await toCreate.save()).toObject();
        return {
            ...created,
            numRecordings: 0
        };
    }

    updateSiteTarget: TargetEndpointType["updateSiteTarget"] = async ({ target, targetId }) => {
        const updated = await Target.findByIdAndUpdate(targetId, target, { new: true });
        return updated !== null
            ? updated.toObject()
            : errorNotFound(`Could not find site ${targetId}`);
    }
}
