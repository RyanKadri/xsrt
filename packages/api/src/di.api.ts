/* istanbul ignore file */
import { assetEndpoint, AxiosSymbol, chunkEndpointMetadata, constant, dependencyGroup, implementationChoice, recordingEndpoint, siteTargetEndpoint } from "@xsrt/common";
import { ApiInitializer, endpointDef, IInitOnStartup, IServerConfig, MongoInitializer } from "@xsrt/common-backend";
import Axios from "axios";
import { DecoratorQueueService } from "../../common-backend/src/queues/decorator-queue-service";
import { ApiServerConfig, ApiServerInitializer } from "./api-server-conf";
import { ChunkEndpoint } from "./endpoints/chunk-endpoint-impl";
import { AssetEndpoint } from "./endpoints/proxy-endpoint-impl";
import { RecordingEndpoint } from "./endpoints/recording-endpoint-impl";
import { TargetEndpoint } from "./endpoints/target-endpoint-impl";

export const apiDiConfig: ApiInitializer[] = [
    implementationChoice(IServerConfig, ApiServerConfig),
    constant(AxiosSymbol, Axios),
    dependencyGroup(IInitOnStartup, [
        MongoInitializer,
        ApiServerInitializer,
        DecoratorQueueService
    ]),
    endpointDef(chunkEndpointMetadata, ChunkEndpoint),
    endpointDef(assetEndpoint, AssetEndpoint),
    endpointDef(recordingEndpoint, RecordingEndpoint),
    endpointDef(siteTargetEndpoint, TargetEndpoint)
];
