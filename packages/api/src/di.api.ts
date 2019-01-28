/* istanbul ignore file */
import { ApiInitializer, dependencyGroup, endpointDef, implementationChoice, IServerConfig, IServerInitializer, MongoInitializer } from "@xsrt/common";
import { chunkEndpointMetadata } from "@xsrt/common/src/endpoint/chunk-endpoint-metadata";
import { assetEndpoint } from "@xsrt/common/src/endpoint/proxy-endpoint-metadata";
import { recordingEndpoint } from "@xsrt/common/src/endpoint/recordings-endpoint-metadata";
import { siteTargetEndpoint } from "@xsrt/common/src/endpoint/target-endpoint-metadata";
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
