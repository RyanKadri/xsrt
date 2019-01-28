/* istanbul ignore file */
import { ApiInitializer, dependencyGroup, endpointDef, implementationChoice, IServerConfig, IServerInitializer, MongoInitializer } from "@xsrt/common";
import { thumbnailEndpointMetadata } from "../../common/src/endpoint/thumbnail-endpoint-metadata";
import { ThumbnailEndpoint } from "./compile-thumbnail/endpoints/thumbnail-endpoints";
import { DecoratorConfig, ExpressInitializer } from "./decorator-server-config";

export const decoratorDiConfig: ApiInitializer[] = [
    implementationChoice(IServerConfig, DecoratorConfig),
    endpointDef(thumbnailEndpointMetadata, ThumbnailEndpoint),
    dependencyGroup(IServerInitializer, [
        MongoInitializer,
        ExpressInitializer
    ])
];
