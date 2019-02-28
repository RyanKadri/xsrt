import { LoggingService } from "@xsrt/common";
import express, { Express, Router } from "express";
import { inject, injectable, multiInject, optional } from "inversify";
import { RouterSetupFn } from "./route-types";

export const IInitOnStartup = Symbol("ServerInitializer");
export interface NeedsInitialization {
    initialize(app: Express): Promise<void>;
}

export const IRouteHandler = Symbol("RouteHandler");
export interface RouteHandler {
    readonly base: string;
    decorateRouter(router: Router): void;
}

export const IServerConfig = Symbol("ServerConfig");
export interface ServerConfig {
    port: number;
    mongoUrl: string; // Should this be in the service-specific configs?
    rabbitHost: string;
}

export const IRouteImplementation = Symbol("RouteImplementation");

@injectable()
export class ExpressServer {

    constructor(
        @multiInject(IInitOnStartup) private initializers: NeedsInitialization[],
        @optional() @multiInject(IRouteHandler) private routeHandlers: RouteHandler[],
        @optional() @multiInject(IRouteImplementation) private routeImplementations: RouterSetupFn[],
        @inject(IServerConfig) private config: ServerConfig,
        private logger: LoggingService
    ) { }

    async start(): Promise<void> {
        const app = express();
        await Promise.all(this.initializers.map(initializer => initializer.initialize(app)));

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
