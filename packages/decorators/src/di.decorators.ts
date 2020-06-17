/* istanbul ignore file */
import { apiDef, assetApiSymbol, assetEndpoint, AxiosSymbol, constant, dependencyGroup, implementationChoice } from "@xsrt/common";
import { ApiDefinition, endpointDef, IExpressConfigurator, IRouteHandler, IServerConfig } from "@xsrt/common-backend";
import Axios from "axios";
import { ConfigEndpoint } from "./compile-thumbnail/endpoints/config-endpoint";
import { ScreenshotStaticRouteHandler } from "./compile-thumbnail/endpoints/screenshot-route-handler";
import { ThumbnailEndpoint } from "./compile-thumbnail/endpoints/thumbnail-endpoints";
import { ElasticConsumer } from "./consumer/elastic-consumer";
import { RawChunkProcessor } from "./consumer/raw-chunk-processor";
import { ScreenshotConsumer } from "./consumer/screenshot-consumer";
import { DecoratorConfig, DecoratorExpressConfigurator } from "./decorator-server-config";
import { configEndpointMetadata } from "./route-metadata/config-endpoint-metadata";
import { thumbnailEndpointMetadata } from "./route-metadata/thumbnail-endpoint-metadata";

export const IDecoratorConsumer = Symbol("IKafkaListeners");

export const decoratorDiConfig: ApiDefinition[] = [
    implementationChoice(IServerConfig, DecoratorConfig),
    constant(AxiosSymbol, Axios),
    apiDef(assetApiSymbol, assetEndpoint),
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
