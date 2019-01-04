import { Container } from "inversify";
import 'reflect-metadata';
import { IRouteImplementation, IServerConfig, IServerInitializer } from '../common/server/express-server';
import { MongoInitializer } from '../common/server/mongo-initializer';
import { ApiServerConfig, ApiServerInitializer } from './api-server-conf';
import { chunkEndpointImplementation, singleChunkEndpointImpl } from './endpoints/chunk-endpoint-impl';
import { multiAssetImpl, singleAssetImpl } from './endpoints/proxy-endpoint-impl';
import { multiRecordingEndpointImpl, recordingMultiDeleteImpl, singleRecordingImpl } from './endpoints/recording-endpoint-impl';
import { multiTargetImpl, singleTargetImpl } from './endpoints/target-endpoint-impl';

const ApiContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

ApiContainer.bind(IServerConfig).to(ApiServerConfig);

ApiContainer.bind(IRouteImplementation).toConstantValue(singleTargetImpl);
ApiContainer.bind(IRouteImplementation).toConstantValue(multiTargetImpl);

ApiContainer.bind(IRouteImplementation).toConstantValue(chunkEndpointImplementation);
ApiContainer.bind(IRouteImplementation).toConstantValue(singleChunkEndpointImpl);

ApiContainer.bind(IRouteImplementation).toConstantValue(multiAssetImpl);
ApiContainer.bind(IRouteImplementation).toConstantValue(singleAssetImpl);

ApiContainer.bind(IRouteImplementation).toConstantValue(multiRecordingEndpointImpl);
ApiContainer.bind(IRouteImplementation).toConstantValue(singleRecordingImpl);
ApiContainer.bind(IRouteImplementation).toConstantValue(recordingMultiDeleteImpl);

ApiContainer.bind(IServerInitializer).to(MongoInitializer);
ApiContainer.bind(IServerInitializer).to(ApiServerInitializer);

export { ApiContainer };

