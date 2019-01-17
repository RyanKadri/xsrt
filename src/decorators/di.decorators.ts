/* istanbul ignore file */
import { IRouteHandler, IServerConfig, IServerInitializer } from "../common/server/express-server";
import { MongoInitializer } from "../common/server/mongo-initializer";
import { dependencyGroup, implementationChoice } from "../common/services/app-initializer";
import { ThumbnailRouteHandler } from "./compile-thumbnail/endpoints/thumbnail-endpoints";
import { DecoratorConfig, ExpressInitializer } from "./decorator-server-config";

export const decoratorDiConfig = [
    implementationChoice(IServerConfig, DecoratorConfig),
    dependencyGroup(IRouteHandler, [
        ThumbnailRouteHandler
    ]),
    dependencyGroup(IServerInitializer, [
        MongoInitializer,
        ExpressInitializer
    ])
];
