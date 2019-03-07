import { DependencyInjector, EndpointDefinition } from "@xsrt/common";
import { Request, Response, Router } from "express";
import { injectable, interfaces } from "inversify";
import { RequestHandler } from "./request-handler";
import { MethodImplementation, RouteImplementation } from "./route-types";

@injectable()
export class RouteImplementer {

    constructor(
        private requestHandler: RequestHandler,
        private diContainer: DependencyInjector
    ) { }

    implement<T extends EndpointDefinition>(
        endpointDef: T, implementations: RouteImplementation<T> | interfaces.Newable<RouteImplementation<T>>
    ) {
        return (router: Router) => {
            const concreteImpl: RouteImplementation<T> = typeof implementations === "function"
                ? this.diContainer.inject(implementations)
                : implementations;

            Object.entries(endpointDef)
                .forEach(([action, definition]) => {
                const route = router[definition.method].bind(router);
                const implementation = concreteImpl[action].bind(concreteImpl);
                if (definition && implementation) {
                    route(definition.url, (req: Request, resp: Response) =>
                        this.requestHandler.handle(
                            definition,
                            implementation as MethodImplementation<any>,
                            req,
                            resp
                        )
                    );
                }
            });
        };
    }
}
