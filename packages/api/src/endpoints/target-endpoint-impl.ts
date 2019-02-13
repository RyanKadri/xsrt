import { siteTargetEndpoint } from "@xsrt/common";
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
                identifiedBy: 1,
                identifier: 1,
                url: 1,
                numRecordings: { $size: "$recordings" }
            } }
        ]);
        return res;
    }

    createSiteTarget: TargetEndpointType["createSiteTarget"] = async ({ target }) => {
        if (target.identifiedBy === "host" && !target.url) {
            target.url = target.identifier;
        }
        const recording = new Target(target);
        const data = await recording.save();
        return data.toObject();
    }
}
