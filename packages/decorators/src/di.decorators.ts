/* istanbul ignore file */
import { apiDef, assetApiSymbol, assetEndpoint, dependencyGroup, implementationChoice, AxiosSymbol, constant } from "@xsrt/common";
import { ApiDefinition, endpointDef, IExpressConfigurator, IRouteHandler, IServerConfig } from "@xsrt/common-backend";
import { ConfigEndpoint } from "./compile-thumbnail/endpoints/config-endpoint";
import { ScreenshotStaticRouteHandler } from "./compile-thumbnail/endpoints/screenshot-route-handler";
import { ThumbnailEndpoint } from "./compile-thumbnail/endpoints/thumbnail-endpoints";
import { DecoratorConfig, DecoratorExpressConfigurator } from "./decorator-server-config";
import { configEndpointMetadata } from "./route-metadata/config-endpoint-metadata";
import { thumbnailEndpointMetadata } from "./route-metadata/thumbnail-endpoint-metadata";
import Axios from "axios";
import { RawChunkProcessor } from "./consumer/raw-chunk-processor";
import { ScreenshotConsumer } from "./consumer/screenshot-consumer";

export const IDecoratorConsumer = Symbol("IKafkaListeners");

export const decoratorDiConfig: ApiDefinition[] = [
    implementationChoice(IServerConfig, DecoratorConfig),
    constant(AxiosSymbol, Axios),
    apiDef(assetApiSymbol, assetEndpoint),
    dependencyGroup(IExpressConfigurator, [
        DecoratorExpressConfigurator
    ]),
    dependencyGroup(IDecoratorConsumer, [
        RawChunkProcessor, ScreenshotConsumer
    ]),
    endpointDef(thumbnailEndpointMetadata, ThumbnailEndpoint),
    endpointDef(configEndpointMetadata, ConfigEndpoint),
    dependencyGroup(IRouteHandler, [
        ScreenshotStaticRouteHandler
    ]),
];
