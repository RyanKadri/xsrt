/* istanbul ignore file */
import { assetEndpoint, chunkEndpointMetadata, constant, dependencyGroup, GotSymbol, implementationChoice, recordingEndpoint, siteTargetEndpoint } from "../../common/src";
import { ApiDefinition, endpointDef, IExpressConfigurator, IServerConfig } from "../../common-backend/src";
import got from "got";
import { ApiServerConfig, ApiServerInitializer } from "./api-server-conf";
import { ChunkEndpoint } from "./endpoints/chunk-endpoint-impl";
import { AssetEndpoint } from "./endpoints/proxy-endpoint-impl";
import { RecordingEndpoint } from "./endpoints/recording-endpoint-impl";
import { TargetEndpoint } from "./endpoints/target-endpoint-impl";
import { serverStatsMetadata } from "../../common/src/endpoint/server-stats-endpoint-metadata";
import { ServerStatsEndpoint } from "./endpoints/server-stats-endpoint-impl";

export const apiDiConfig: ApiDefinition[] = [
    implementationChoice(IServerConfig, ApiServerConfig),
    constant(GotSymbol, got),
    dependencyGroup(IExpressConfigurator, [
        ApiServerInitializer
    ]),
    endpointDef(chunkEndpointMetadata, ChunkEndpoint),
    endpointDef(assetEndpoint, AssetEndpoint),
    endpointDef(recordingEndpoint, RecordingEndpoint),
    endpointDef(siteTargetEndpoint, TargetEndpoint),
    endpointDef(serverStatsMetadata, ServerStatsEndpoint)
];
