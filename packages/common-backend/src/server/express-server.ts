import { LoggingService } from "../../../common/src";
import express, { Router, Express } from "express";
import { inject, injectable, multiInject, optional } from "inversify";
import { RouterSetupFn } from "./route-types";

export const IExpressConfigurator = Symbol("ServerInitializer");
export interface ExpressConfigurator {
  initialize(express: Express): Promise<void>;
}

export const IRouteHandler = Symbol("RouteHandler");
export interface RouteHandler {
  readonly base: string;
  decorateRouter(router: Router): void;
}

export const IServerConfig = Symbol("ServerConfig");
export interface ServerConfig {
  port: number;
  rabbitHost: string;
  elasticUrl: string;
}

export const IRouteImplementation = Symbol("RouteImplementation");

@injectable()
export class ExpressServer {

  constructor(
    @optional() @multiInject(IExpressConfigurator) private configurators: ExpressConfigurator[],
    @optional() @multiInject(IRouteHandler) private routeHandlers: RouteHandler[],
    @optional() @multiInject(IRouteImplementation) private routeImplementations: RouterSetupFn[],
    @inject(IServerConfig) private config: ServerConfig,
    private logger: LoggingService
  ) { }

  async start(): Promise<void> {
    const app = express();

    try {
      await Promise.all(this.configurators.map(configurator => configurator.initialize(app)));
    } catch(e) {
      this.logger.error(`Error while configuring server: ${e.message}`)
    }
    this.routeHandlers.forEach(handler => {
      const router = Router();
      handler.decorateRouter(router);
      app.use(handler.base, router);
    });
    this.routeImplementations.forEach(impl => {
      const router = Router();
      impl(router);
      app.use("/api", router);
    });
    app.listen(this.config.port,
      () => this.logger.info(`Server listening on port ${this.config.port}`)
    );
  }
}
