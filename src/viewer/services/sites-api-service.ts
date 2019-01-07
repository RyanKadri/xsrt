import { SiteTarget } from "@common/db/targets";
import { Without } from "@common/utils/type-utils";
import { injectable } from "inversify";
import { createApi } from '../../api/endpoints/route';
import { siteTargetEndpoint } from '../../api/endpoints/target-endpoint-metadata';

export const targetApiService = createApi(siteTargetEndpoint);

@injectable()
export class TargetApiService {
    private readonly siteApi = createApi(siteTargetEndpoint);

    deleteSite(site: SiteTarget): any {
        return this.siteApi.deleteSiteTarget({ targetId: site._id })
    }

    fetchSites(): Promise<SiteTarget[]> {
        return this.siteApi.filterTargets();
    }

    createSite(newSite: Without<SiteTarget, "_id">) {
        return this.siteApi.createSiteTarget({ target: newSite});
    }
}