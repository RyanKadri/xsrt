import { Container } from "inversify";
import { IRouteImplementation, IServerConfig, IServerInitializer } from "../common/server/express-server";
import { RouteImplementer } from "../common/server/implement-route";
import { MongoInitializer } from "../common/server/mongo-initializer";
import { ApiServerConfig, ApiServerInitializer } from "./api-server-conf";
import { ChunkEndpoint } from "./endpoints/chunk-endpoint-impl";
import { chunkEndpointMetadata } from "./endpoints/chunk-endpoint-metadata";
import { AssetEndpoint } from "./endpoints/proxy-endpoint-impl";
import { assetEndpoint } from "./endpoints/proxy-endpoint-metadata";
import { RecordingEndpoint } from "./endpoints/recording-endpoint-impl";
import { recordingEndpoint } from "./endpoints/recordings-endpoint-metadata";
import { TargetEndpoint } from "./endpoints/target-endpoint-impl";
import { siteTargetEndpoint } from "./endpoints/target-endpoint-metadata";

const ApiContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

ApiContainer.bind(IServerConfig).to(ApiServerConfig);

const endpointImplementer = ApiContainer.get(RouteImplementer);

[
    { def: chunkEndpointMetadata, impl: ChunkEndpoint },
    { def: assetEndpoint, impl: AssetEndpoint },
    { def: recordingEndpoint, impl: RecordingEndpoint },
    { def: siteTargetEndpoint, impl: TargetEndpoint },
]
    .map(({ def, impl }) => endpointImplementer.implement(def, impl))
    .forEach(route => ApiContainer.bind(IRouteImplementation).toConstantValue(route));

ApiContainer.bind(IServerInitializer).to(MongoInitializer);
ApiContainer.bind(IServerInitializer).to(ApiServerInitializer);

export { ApiContainer };
