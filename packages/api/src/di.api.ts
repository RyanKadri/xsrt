/* istanbul ignore file */
import { assetEndpoint, chunkEndpointMetadata, dependencyGroup, implementationChoice, recordingEndpoint, siteTargetEndpoint } from "@xsrt/common";
import { ApiInitializer, endpointDef, IServerConfig, IServerInitializer, MongoInitializer } from "@xsrt/common-backend";
import { ApiServerConfig, ApiServerInitializer } from "./api-server-conf";
import { ChunkEndpoint } from "./endpoints/chunk-endpoint-impl";
import { AssetEndpoint } from "./endpoints/proxy-endpoint-impl";
import { RecordingEndpoint } from "./endpoints/recording-endpoint-impl";
import { TargetEndpoint } from "./endpoints/target-endpoint-impl";

export const apiDiConfig: ApiInitializer[] = [
    implementationChoice(IServerConfig, ApiServerConfig),
    dependencyGroup(IServerInitializer, [
        MongoInitializer, ApiServerInitializer
    ]),
    endpointDef(chunkEndpointMetadata, ChunkEndpoint),
    endpointDef(assetEndpoint, AssetEndpoint),
    endpointDef(recordingEndpoint, RecordingEndpoint),
    endpointDef(siteTargetEndpoint, TargetEndpoint)
];
