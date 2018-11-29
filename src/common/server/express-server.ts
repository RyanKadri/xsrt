import { injectable, multiInject, inject } from "inversify";
import express, { Express, Router } from "express";

export const IServerInitializer = Symbol('ServerInitializer');
export interface ServerInitializer {
    initialize(app: Express): Promise<void>
}

//TODO - Revisit this interface. Can / should this be abstracted any more?
export const IRouteHandler = Symbol('RouteHandler');
export interface RouteHandler {
    readonly base: string;
    buildRouter(): Router
}

export const IServerConfig = Symbol("ServerConfig");
export interface ServerConfig {
    port: number;
    mongoUrl: string; //Should this be in the service-specific configs?
}

@injectable()
export class ExpressServer {

    constructor(
        @multiInject(IServerInitializer) private initializers: ServerInitializer[],
        @multiInject(IRouteHandler) private routeHandlers: RouteHandler[],
        @inject(IServerConfig) private config: ServerConfig
    ) { }

    async start(): Promise<void> {
        const app = express();
        await Promise.all(this.initializers.map(initializer => initializer.initialize(app)));

        this.routeHandlers.forEach(handler => {
            app.use(handler.base, handler.buildRouter());
        })
        app.listen(this.config.port, () => console.log(`Server listening on port ${this.config.port}`))
    }
}