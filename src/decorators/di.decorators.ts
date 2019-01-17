/* istanbul ignore file */
import { endpointDef } from "../common/server/api-initializer";
import { IServerConfig, IServerInitializer } from "../common/server/express-server";
import { MongoInitializer } from "../common/server/mongo-initializer";
import { dependencyGroup, implementationChoice } from "../common/services/app-initializer";
import { thumbnailEndpointMetadata } from "./compile-thumbnail/endpoints/thumbnail-endpoint-metadata";
import { ThumbnailEndpoint } from "./compile-thumbnail/endpoints/thumbnail-endpoints";
import { DecoratorConfig, ExpressInitializer } from "./decorator-server-config";

export const decoratorDiConfig = [
    implementationChoice(IServerConfig, DecoratorConfig),
    endpointDef(thumbnailEndpointMetadata, ThumbnailEndpoint),
    dependencyGroup(IServerInitializer, [
        MongoInitializer,
        ExpressInitializer
    ])
];
