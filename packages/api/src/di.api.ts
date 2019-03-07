/* istanbul ignore file */
import { assetEndpoint, AxiosSymbol, chunkEndpointMetadata, constant, implementationChoice, recordingEndpoint, siteTargetEndpoint, dependencyGroup } from "@xsrt/common";
import { ApiDefinition, endpointDef, IServerConfig, IExpressConfigurator } from "@xsrt/common-backend";
import Axios from "axios";
import { ApiServerConfig, ApiServerInitializer } from "./api-server-conf";
import { ChunkEndpoint } from "./endpoints/chunk-endpoint-impl";
import { AssetEndpoint } from "./endpoints/proxy-endpoint-impl";
import { RecordingEndpoint } from "./endpoints/recording-endpoint-impl";
import { TargetEndpoint } from "./endpoints/target-endpoint-impl";

export const apiDiConfig: ApiDefinition[] = [
    implementationChoice(IServerConfig, ApiServerConfig),
    constant(AxiosSymbol, Axios),
    dependencyGroup(IExpressConfigurator, [
        ApiServerInitializer
    ]),
    endpointDef(chunkEndpointMetadata, ChunkEndpoint),
    endpointDef(assetEndpoint, AssetEndpoint),
    endpointDef(recordingEndpoint, RecordingEndpoint),
    endpointDef(siteTargetEndpoint, TargetEndpoint)
];
