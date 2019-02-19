import { IServerConfig, RouteImplementation } from "@xsrt/common-backend";
import { inject, injectable } from "inversify";
import { DecoratorConfig } from "../../decorator-server-config";
import { configEndpointMetadata } from "../../route-metadata/config-endpoint-metadata";

type ConfigEndpointType = RouteImplementation<typeof configEndpointMetadata>;

@injectable()
export class ConfigEndpoint implements ConfigEndpointType {
    constructor(
        @inject(IServerConfig) private serverConfig: Pick<DecoratorConfig, "recordingHost">
    ) {}

    fetchConfig: ConfigEndpointType["fetchConfig"] = async () => {
        return {
            recordingHost: this.serverConfig.recordingHost
        };
    }

}
