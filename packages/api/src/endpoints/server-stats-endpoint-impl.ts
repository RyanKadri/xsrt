import { injectable } from "inversify";
import { RouteImplementation } from "../../../common-backend/src";
import { serverStatsMetadata } from "../../../common/src/endpoint/server-stats-endpoint-metadata";

type StatsEndpointType = RouteImplementation<typeof serverStatsMetadata>;

@injectable()
export class ServerStatsEndpoint implements StatsEndpointType {
  health: StatsEndpointType["health"] = () => {
    return { success: true }
  }
}
