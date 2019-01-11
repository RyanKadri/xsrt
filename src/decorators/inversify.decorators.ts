import { Container } from "inversify";
import { IRouteHandler, IServerConfig, IServerInitializer } from "../common/server/express-server";
import { MongoInitializer } from "../common/server/mongo-initializer";
import { ThumbnailRouteHandler } from "./compile-thumbnail/endpoints/thumbnail-endpoints";
import { DecoratorConfig, ExpressInitializer } from "./decorator-server-config";

const DecoratorContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

DecoratorContainer.bind(IServerConfig).to(DecoratorConfig);
DecoratorContainer.bind(IRouteHandler).to(ThumbnailRouteHandler);
DecoratorContainer.bind(IServerInitializer).to(MongoInitializer);
DecoratorContainer.bind(IServerInitializer).to(ExpressInitializer);

export { DecoratorContainer };
