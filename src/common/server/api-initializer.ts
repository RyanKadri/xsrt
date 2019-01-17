import { interfaces } from "inversify";
import { constantWithDeps, DIInitializer, initializeApp } from "../services/app-initializer";
import { IRouteImplementation } from "./express-server";
import { RouteImplementer } from "./implement-route";
import { EndpointDefinition, RouteImplementation } from "./route-types";

export function initializeApi(initializers: ApiInitializer[]) {
    return initializeApp(initializers.map(init => (
        init.type !== "endpoint"
            ? init
            : constantWithDeps(
                IRouteImplementation,
                [RouteImplementer],
                (implementor: RouteImplementer) => implementor.implement(init.endpointDef, init.implementation)
            )
    )));
}

export function endpointDef(
    def: EndpointDefinition,
    implementation: interfaces.Newable<any>
): EndpointInitializer {
    return {
        type: "endpoint", endpointDef: def, implementation
    };
}

export type ApiInitializer = DIInitializer | EndpointInitializer;

interface EndpointInitializer {
    type: "endpoint";
    endpointDef: EndpointDefinition;
    implementation: interfaces.Newable<RouteImplementation<any>>;
}
