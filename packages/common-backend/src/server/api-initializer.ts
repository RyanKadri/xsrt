import { constantWithDeps, DIDefinition, EndpointDefinition, initializeApp, NeedsInitialization } from "@xsrt/common";
import dotenv from "dotenv";
import { interfaces } from "inversify";
import { IRouteImplementation, ExpressServer } from "./express-server";
import { RouteImplementer } from "./implement-route";
import { RouteImplementation } from "./route-types";

dotenv.load();

/* A convenience method for starting a project that exposes express endpoints */
export async function initializeExpressApp(
    definitions: ApiDefinition[], initializers: interfaces.Newable<NeedsInitialization>[] = []
) {
    const transformedDefs = definitions.map(init => (
        init.type !== "endpoint"
            ? init
            : constantWithDeps(
                IRouteImplementation,
                [RouteImplementer],
                (implementor: RouteImplementer) => implementor.implement(init.endpointDef, init.implementation)
            )
    ));
    const injector = await initializeApp(transformedDefs, initializers);
    await injector.inject(ExpressServer).start();
}

export function endpointDef(
    def: EndpointDefinition,
    implementation: interfaces.Newable<any>
): EndpointInitializer {
    return {
        type: "endpoint", endpointDef: def, implementation
    };
}

export type ApiDefinition = DIDefinition | EndpointInitializer;

interface EndpointInitializer {
    type: "endpoint";
    endpointDef: EndpointDefinition;
    implementation: interfaces.Newable<RouteImplementation<any>>;
}
