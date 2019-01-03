import express, { Express, Router } from "express";
import { inject, injectable, multiInject } from "inversify";
import { RouterSetupFn } from '../../api/endpoints/route';

export const IServerInitializer = Symbol('ServerInitializer');
export interface ServerInitializer {
    initialize(app: Express): Promise<void>
}

//TODO - Revisit this interface. Can / should this be abstracted any more?
export const IRouteHandler = Symbol('RouteHandler');
export interface RouteHandler {
    readonly base: string;
    decorateRouter(router: Router): void;
}

export const IServerConfig = Symbol("ServerConfig");
export interface ServerConfig {
    port: number;
    mongoUrl: string; //Should this be in the service-specific configs?
}

export const IRouteImplementation = Symbol("RouteImplementation");

@injectable()
export class ExpressServer {

    constructor(
        @multiInject(IServerInitializer) private initializers: ServerInitializer[],
        @multiInject(IRouteHandler) private routeHandlers: RouteHandler[],
        @multiInject(IRouteImplementation) private routeImplementations: RouterSetupFn[],
        @inject(IServerConfig) private config: ServerConfig
    ) { }

    async start(): Promise<void> {
        const app = express();
        await Promise.all(this.initializers.map(initializer => initializer.initialize(app)));

        this.routeHandlers.forEach(handler => {
            const router = Router();
            handler.decorateRouter(router)
            app.use(handler.base, router);
        })
        this.routeImplementations.forEach(impl => {
            const router = Router();
            impl(router);
            app.use("/api", router)
        })
        app.listen(this.config.port, () => console.log(`Server listening on port ${this.config.port}`))
    }
}