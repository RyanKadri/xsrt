/* istanbul ignore file */
import { dependencyGroup, implementationChoice } from "@xsrt/common";
import { ApiInitializer, endpointDef, IRouteHandler, IServerConfig, IServerInitializer, MongoInitializer } from "@xsrt/common-backend";
import { ConfigEndpoint } from "./compile-thumbnail/endpoints/config-endpoint";
import { ScreenshotStaticRouteHandler } from "./compile-thumbnail/endpoints/screenshot-route-handler";
import { ThumbnailEndpoint } from "./compile-thumbnail/endpoints/thumbnail-endpoints";
import { DecoratorConfig, ExpressInitializer } from "./decorator-server-config";
import { configEndpointMetadata } from "./route-metadata/config-endpoint-metadata";
import { thumbnailEndpointMetadata } from "./route-metadata/thumbnail-endpoint-metadata";

export const decoratorDiConfig: ApiInitializer[] = [
    implementationChoice(IServerConfig, DecoratorConfig),
    endpointDef(thumbnailEndpointMetadata, ThumbnailEndpoint),
    endpointDef(configEndpointMetadata, ConfigEndpoint),
    dependencyGroup(IServerInitializer, [
        MongoInitializer,
        ExpressInitializer
    ]),
    dependencyGroup(IRouteHandler, [
        ScreenshotStaticRouteHandler
    ])
];
