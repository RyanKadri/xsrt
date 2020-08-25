import { EndpointApi, SiteTarget, siteTargetApiSymbol, siteTargetEndpoint, Without } from "../../../common/src";
import { inject, injectable } from "inversify";

@injectable()
export class TargetApiService {

  /* istanbul ignore next */
  constructor(
    @inject(siteTargetApiSymbol) private siteApi: EndpointApi<typeof siteTargetEndpoint>
  ) { }

  /* istanbul ignore next */
  deleteSite(site: SiteTarget): any {
    return this.siteApi.deleteSiteTarget({ targetId: site.customerId });
  }

  /* istanbul ignore next */
  fetchSites(): Promise<SiteTarget[]> {
    return this.siteApi.filterTargets();
  }

  /* istanbul ignore next */
  createSite(newSite: Without<SiteTarget, "id">) {
    return this.siteApi.createSiteTarget({ target: newSite });
  }

  async updateSite(site: SiteTarget): Promise<SiteTarget> {
    const res = await this.siteApi.updateSiteTarget({ target: site, targetId: site.customerId });
    return {
      ...site,
      ...res
    };
  }
}
