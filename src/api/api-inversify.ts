import { Container } from "inversify";
import 'reflect-metadata';
import { IRouteImplementation, IServerConfig, IServerInitializer } from '../common/server/express-server';
import { MongoInitializer } from '../common/server/mongo-initializer';
import { ApiServerConfig, ApiServerInitializer } from './api-server-conf';
import { chunkEndpointImplementation as chunkEndpointImpl } from './endpoints/chunk-endpoint-impl';
import { assetEndpointImpl } from './endpoints/proxy-endpoint-impl';
import { recordingEndpointImpl } from './endpoints/recording-endpoint-impl';
import { targetEndpointImpl } from './endpoints/target-endpoint-impl';

const ApiContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

ApiContainer.bind(IServerConfig).to(ApiServerConfig);

ApiContainer.bind(IRouteImplementation).toConstantValue(targetEndpointImpl);
ApiContainer.bind(IRouteImplementation).toConstantValue(chunkEndpointImpl);
ApiContainer.bind(IRouteImplementation).toConstantValue(assetEndpointImpl);
ApiContainer.bind(IRouteImplementation).toConstantValue(recordingEndpointImpl);

ApiContainer.bind(IServerInitializer).to(MongoInitializer);
ApiContainer.bind(IServerInitializer).to(ApiServerInitializer);

export { ApiContainer };

