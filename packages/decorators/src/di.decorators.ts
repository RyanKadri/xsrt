/* istanbul ignore file */
import { dependencyGroup, implementationChoice } from "@xsrt/common";
import { ApiInitializer, endpointDef, IServerConfig, IServerInitializer, MongoInitializer } from "@xsrt/common-backend";
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
