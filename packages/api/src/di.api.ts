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
import { S3StorageService } from "./services/assets/s3-asset-storage-service";
import { FSStorageService } from "./services/assets/fs-asset-storage-service";
import { IAssetStorageService } from "./services/assets/asset-storage-service";

export const apiDiConfig: ApiDefinition[] = [
  implementationChoice(IServerConfig, ApiServerConfig),
  constant(GotSymbol, got),
  implementationChoice(IChunkSender, (process.env.USE_SQS === "true" ? SQSChunkSender : RabbitChunkSender) as any),
  implementationChoice(IAssetStorageService, (process.env.USE_S3 === "true" ? S3StorageService : FSStorageService) as any),
  dependencyGroup(IExpressConfigurator, [
    ApiServerInitializer
  ]),
  endpointDef(chunkEndpointMetadata, ChunkEndpoint),
  endpointDef(assetEndpoint, AssetEndpoint),
  endpointDef(recordingEndpoint, RecordingEndpoint),
  endpointDef(siteTargetEndpoint, TargetEndpoint),
  endpointDef(serverStatsMetadata, ServerStatsEndpoint)
];
