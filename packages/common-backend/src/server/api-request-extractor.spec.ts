import { ApiRequestPartExtractor } from "@xsrt/common";
import { RequestBodyUnwrap, RequestParamUnwrap, RouteParamUnwrap } from "@xsrt/common";

describe(ApiRequestPartExtractor.name, () => {
    const service = new ApiRequestPartExtractor();
    it('Can extract route and query parameters from a client request object based on the route config', () => {
        const paramMapping = {
            thingId: new RouteParamUnwrap("thingId"),
            blahh: new RequestParamUnwrap("blahh")
        };
        const request = { thingId: 123, blahh: "test" };
        const routeParams = service.extractRouteParams(paramMapping, request);
        expect(routeParams).toEqual({ thingId: 123 });

        const queryParams = service.extractQueryParams(paramMapping, request);
        expect(queryParams).toEqual({ blahh: "test" });
    });

    it('Can extract the (single) request body', () => {
        const paramMapping = {
            thingId: new RouteParamUnwrap("thingId"),
            body: new RequestBodyUnwrap(),
        }
        const request = {
            thingId: "123",
            body: {
                hello: "world"
            }
        }
        const body = service.extractBody(paramMapping, request);
        expect(body).toEqual({ hello: "world" })
    })
})
