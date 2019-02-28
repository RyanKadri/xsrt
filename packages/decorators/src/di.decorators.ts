/* istanbul ignore file */
import { dependencyGroup, implementationChoice } from "@xsrt/common";
import { ApiInitializer, endpointDef, IInitOnStartup, IRouteHandler, IServerConfig, MongoInitializer } from "@xsrt/common-backend";
import { ConfigEndpoint } from "./compile-thumbnail/endpoints/config-endpoint";
import { ScreenshotStaticRouteHandler } from "./compile-thumbnail/endpoints/screenshot-route-handler";
import { ThumbnailEndpoint } from "./compile-thumbnail/endpoints/thumbnail-endpoints";
import { DecoratorConfig, DecoratorExpressInitializer } from "./decorator-server-config";
import { configEndpointMetadata } from "./route-metadata/config-endpoint-metadata";
import { thumbnailEndpointMetadata } from "./route-metadata/thumbnail-endpoint-metadata";
import { QueueConsumerService } from "./services/queue-consumer-service";

export const IDecoratorConsumer = Symbol("IKafkaListeners");

export const decoratorDiConfig: ApiInitializer[] = [
    implementationChoice(IServerConfig, DecoratorConfig),
    endpointDef(thumbnailEndpointMetadata, ThumbnailEndpoint),
    endpointDef(configEndpointMetadata, ConfigEndpoint),
    dependencyGroup(IInitOnStartup, [
        MongoInitializer, DecoratorExpressInitializer, QueueConsumerService
    ]),
    dependencyGroup(IRouteHandler, [
        ScreenshotStaticRouteHandler
    ]),
];
