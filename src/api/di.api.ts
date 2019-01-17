/* istanbul ignore file */
import { endpointDef } from "../common/server/api-initializer";
import { IServerConfig, IServerInitializer } from "../common/server/express-server";
import { MongoInitializer } from "../common/server/mongo-initializer";
import { dependencyGroup, implementationChoice } from "../common/services/app-initializer";
import { ApiServerConfig, ApiServerInitializer } from "./api-server-conf";
import { ChunkEndpoint } from "./endpoints/chunk-endpoint-impl";
import { chunkEndpointMetadata } from "./endpoints/chunk-endpoint-metadata";
import { AssetEndpoint } from "./endpoints/proxy-endpoint-impl";
import { assetEndpoint } from "./endpoints/proxy-endpoint-metadata";
import { RecordingEndpoint } from "./endpoints/recording-endpoint-impl";
import { recordingEndpoint } from "./endpoints/recordings-endpoint-metadata";
import { TargetEndpoint } from "./endpoints/target-endpoint-impl";
import { siteTargetEndpoint } from "./endpoints/target-endpoint-metadata";

export const apiDiConfig = [
    implementationChoice(IServerConfig, ApiServerConfig),
    dependencyGroup(IServerInitializer, [
        MongoInitializer, ApiServerInitializer
    ]),
    endpointDef(chunkEndpointMetadata, ChunkEndpoint),
    endpointDef(assetEndpoint, AssetEndpoint),
    endpointDef(recordingEndpoint, RecordingEndpoint),
    endpointDef(siteTargetEndpoint, TargetEndpoint)
];
