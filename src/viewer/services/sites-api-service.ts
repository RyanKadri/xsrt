import { inject, injectable } from "inversify";
import { siteTargetApiSymbol, siteTargetEndpoint } from "../../api/endpoints/target-endpoint-metadata";
import { SiteTarget } from "../../common/db/targets";
import { EndpointApi } from "../../common/server/route-types";
import { Without } from "../../common/utils/type-utils";

@injectable()
export class TargetApiService {

    /* istanbul ignore next */
    constructor(
        @inject(siteTargetApiSymbol) private siteApi: EndpointApi<typeof siteTargetEndpoint>
    ) { }

    /* istanbul ignore next */
    deleteSite(site: SiteTarget): any {
        return this.siteApi.deleteSiteTarget({ targetId: site._id });
    }

    /* istanbul ignore next */
    fetchSites(): Promise<SiteTarget[]> {
        return this.siteApi.filterTargets();
    }

    /* istanbul ignore next */
    createSite(newSite: Without<SiteTarget, "_id">) {
        return this.siteApi.createSiteTarget({ target: newSite});
    }
}
