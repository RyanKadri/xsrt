import { Request, Response, Router } from "express";
import { injectable, interfaces } from "inversify";
import { ApiContainer } from "../../api/api-inversify";
import { RequestHandler } from "./request-handler";
import { EndpointDefinition, RouteImplementation } from "./route-types";

@injectable()
export class RouteImplementer {

    constructor(
        private requestHandler: RequestHandler
    ) { }

    implement<T extends EndpointDefinition>(
        endpointDef: T, implementations: RouteImplementation<T> | interfaces.Newable<RouteImplementation<T>>
    ) {
        return (router: Router) => {
            const concreteImpl: RouteImplementation<T> = typeof implementations === "function"
                ? ApiContainer.get(implementations)
                : implementations;

            Object.entries(endpointDef)
                .forEach(([action, definition]) => {
                const route = router[definition.method].bind(router);
                const implementation = concreteImpl[action];

                if (definition && implementation) {
                    route(definition.url, (req: Request, resp: Response) =>
                        this.requestHandler.handle(definition.request, implementation, req, resp)
                    );
                }
            });
        };
    }
}
