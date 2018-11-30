import { injectable } from "inversify";
import Axios from "axios";
import { SiteTarget } from "@common/db/targets";
import { Without } from "@common/utils/type-utils";

@injectable()
export class TargetApiService {
    deleteSite(site: SiteTarget): any {
        return Axios.delete(`/api/targets/${site._id}`).then(res => res.data);
    }

    fetchSites(): Promise<SiteTarget[]> {
        return Axios.get('/api/targets').then(res => res.data);
    }

    createSite(newSite: Without<SiteTarget, "_id">) {
        return Axios.post('/api/targets', newSite).then(res => res.data);
    }
}