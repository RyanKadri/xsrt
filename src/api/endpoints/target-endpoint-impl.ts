import { injectable } from "inversify";
import { Target } from "../../common/db/targets";
import { errorNotFound } from "../../common/server/request-handler";
import { RouteImplementation } from "../../common/server/route-types";
import { siteTargetEndpoint } from "./target-endpoint-metadata";

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
        const res = await Target.find({});
        return res.map(doc => doc.toObject());
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
