/* istanbul ignore file */
import got from "got";
import { ApiDefinition, endpointDef, IChunkSender, IExpressConfigurator, IServerConfig, RabbitChunkSender, SQSChunkSender } from "../../common-backend/src";
import { assetEndpoint, chunkEndpointMetadata, constant, dependencyGroup, GotSymbol, implementationChoice, recordingEndpoint, siteTargetEndpoint } from "../../common/src";
import { serverStatsMetadata } from "../../common/src/endpoint/server-stats-endpoint-metadata";
import { ApiServerConfig, ApiServerInitializer } from "./api-server-conf";
import { ChunkEndpoint } from "./endpoints/chunk-endpoint-impl";
import { AssetEndpoint } from "./endpoints/proxy-endpoint-impl";
import { RecordingEndpoint } from "./endpoints/recording-endpoint-impl";
import { ServerStatsEndpoint } from "./endpoints/server-stats-endpoint-impl";
import { TargetEndpoint } from "./endpoints/target-endpoint-impl";

export const apiDiConfig: ApiDefinition[] = [
    implementationChoice(IServerConfig, ApiServerConfig),
    constant(GotSymbol, got),
    implementationChoice(IChunkSender, (process.env.USE_SQS === "true" ? SQSChunkSender : RabbitChunkSender) as any),
    dependencyGroup(IExpressConfigurator, [
        ApiServerInitializer
    ]),
    endpointDef(chunkEndpointMetadata, ChunkEndpoint),
    endpointDef(assetEndpoint, AssetEndpoint),
    endpointDef(recordingEndpoint, RecordingEndpoint),
    endpointDef(siteTargetEndpoint, TargetEndpoint),
    endpointDef(serverStatsMetadata, ServerStatsEndpoint)
];
