/* istanbul ignore file */
import { apiDef, assetApiSymbol, assetEndpoint, constant, dependencyGroup, GotSymbol, FetchSymbol, implementationChoice } from "../../common/src";
import { ApiDefinition, endpointDef, IExpressConfigurator, IRouteHandler, IServerConfig, IChunkSender, SQSChunkSender, RabbitChunkSender, IAssetStorageService, S3StorageService, FSStorageService } from "../../common-backend/src";
import got from "got";
import { ConfigEndpoint } from "./compile-thumbnail/endpoints/config-endpoint";
import { ScreenshotStaticRouteHandler } from "./compile-thumbnail/endpoints/screenshot-route-handler";
import { ThumbnailEndpoint } from "./compile-thumbnail/endpoints/thumbnail-endpoints";
import { ElasticConsumer } from "./consumer/elastic-consumer";
import { RawChunkProcessor } from "./consumer/raw-chunk-processor";
import { ScreenshotConsumer } from "./consumer/screenshot-consumer";
import { decoratorConfig, DecoratorExpressConfigurator } from "./decorator-server-config";
import { configEndpointMetadata } from "./route-metadata/config-endpoint-metadata";
import { thumbnailEndpointMetadata } from "./route-metadata/thumbnail-endpoint-metadata";
import unfetch from "isomorphic-unfetch";

export const IDecoratorConsumer = Symbol("IKafkaListeners");

export const decoratorDiConfig: ApiDefinition[] = [
    constant(IServerConfig, decoratorConfig),
    constant(GotSymbol, got),
    constant(FetchSymbol, unfetch),
    implementationChoice(IChunkSender, (process.env.USE_SQS === "true" ? SQSChunkSender : RabbitChunkSender) as any),
    implementationChoice(IAssetStorageService, (process.env.USE_S3 === "true" ? S3StorageService : FSStorageService) as any),
    apiDef(assetApiSymbol, assetEndpoint, { baseUrl: decoratorConfig.proxyHost }),
    dependencyGroup(IExpressConfigurator, [
        DecoratorExpressConfigurator
    ]),
    dependencyGroup(IDecoratorConsumer, [
        RawChunkProcessor, ScreenshotConsumer, ElasticConsumer
    ]),
    endpointDef(thumbnailEndpointMetadata, ThumbnailEndpoint),
    endpointDef(configEndpointMetadata, ConfigEndpoint),
    dependencyGroup(IRouteHandler, [
        ScreenshotStaticRouteHandler
    ]),
];
