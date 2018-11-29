import 'reflect-metadata';
import { Container } from "inversify";
import { IServerConfig, IRouteHandler, IServerInitializer } from '../common/server/express-server';
import { ApiServerConfig, ApiServerInitializer } from './api-server-conf';
import { RecordingRouteHandler } from './endpoints/recordings';
import { MongoInitializer } from '../common/server/mongo-initializer';

const ApiContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

ApiContainer.bind(IServerConfig).to(ApiServerConfig);
ApiContainer.bind(IRouteHandler).to(RecordingRouteHandler);
ApiContainer.bind(IServerInitializer).to(MongoInitializer);
ApiContainer.bind(IServerInitializer).to(ApiServerInitializer);

export { ApiContainer };