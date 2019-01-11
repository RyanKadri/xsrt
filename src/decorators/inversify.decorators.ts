import "reflect-metadata";
import { Container } from "inversify";
import { IServerConfig, IRouteHandler, IServerInitializer } from "../common/server/express-server";
import { DecoratorConfig, ExpressInitializer } from "./decorator-server-config";
import { ThumbnailRouteHandler } from "./compile-thumbnail/endpoints/thumbnail-endpoints";
import { MongoInitializer } from "../common/server/mongo-initializer";

const DecoratorContainer = new Container({ autoBindInjectable: true, defaultScope: "Singleton" });

DecoratorContainer.bind(IServerConfig).to(DecoratorConfig);
DecoratorContainer.bind(IRouteHandler).to(ThumbnailRouteHandler);
DecoratorContainer.bind(IServerInitializer).to(MongoInitializer);
DecoratorContainer.bind(IServerInitializer).to(ExpressInitializer);

export { DecoratorContainer };
