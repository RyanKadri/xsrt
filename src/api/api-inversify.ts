import { Container } from "inversify";
import 'reflect-metadata';
import { IRouteHandler, IRouteImplementation, IServerConfig, IServerInitializer } from '../common/server/express-server';
import { MongoInitializer } from '../common/server/mongo-initializer';
import { ApiServerConfig, ApiServerInitializer } from './api-server-conf';
import { chunkEndpointImplementation, singleChunkEndpointImpl } from './endpoints/chunk-endpoint-impl';
import { multiAssetImpl, singleAssetImpl } from './endpoints/proxy-endpoint-impl';
import { RecordingRouteHandler } from './endpoints/recordings';
import { TargetRouteHandler } from './endpoints/targets';

const ApiContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

ApiContainer.bind(IServerConfig).to(ApiServerConfig);
ApiContainer.bind(IRouteHandler).to(RecordingRouteHandler);
ApiContainer.bind(IRouteHandler).to(TargetRouteHandler);
ApiContainer.bind(IRouteImplementation).toConstantValue(chunkEndpointImplementation);
ApiContainer.bind(IRouteImplementation).toConstantValue(singleChunkEndpointImpl);
ApiContainer.bind(IRouteImplementation).toConstantValue(multiAssetImpl);
ApiContainer.bind(IRouteImplementation).toConstantValue(singleAssetImpl);
ApiContainer.bind(IServerInitializer).to(MongoInitializer);
ApiContainer.bind(IServerInitializer).to(ApiServerInitializer);

export { ApiContainer };

