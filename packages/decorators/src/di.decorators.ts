/* istanbul ignore file */
import { apiDef, assetApiSymbol, assetEndpoint, constant, dependencyGroup, GotSymbol, FetchSymbol } from "../../common/src";
import { ApiDefinition, endpointDef, IExpressConfigurator, IRouteHandler, IServerConfig } from "../../common-backend/src";
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
