import { Container } from "inversify";
import 'reflect-metadata';
import { IRouteHandler, IServerConfig, IServerInitializer } from '../common/server/express-server';
import { MongoInitializer } from '../common/server/mongo-initializer';
import { ApiServerConfig, ApiServerInitializer } from './api-server-conf';
import { ChunkEndpoint } from './endpoints/chunks';
import { AssetProxyHandler } from './endpoints/proxy';
import { RecordingRouteHandler } from './endpoints/recordings';
import { TargetRouteHandler } from './endpoints/targets';

const ApiContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

ApiContainer.bind(IServerConfig).to(ApiServerConfig);
ApiContainer.bind(IRouteHandler).to(RecordingRouteHandler);
ApiContainer.bind(IRouteHandler).to(TargetRouteHandler);
ApiContainer.bind(IRouteHandler).to(AssetProxyHandler);
ApiContainer.bind(IRouteHandler).to(ChunkEndpoint);
ApiContainer.bind(IServerInitializer).to(MongoInitializer);
ApiContainer.bind(IServerInitializer).to(ApiServerInitializer);

export { ApiContainer };
