import { RequestParamUnwrap, RouteParamUnwrap, Type } from "../endpoint/types";
import { ApiCreationService } from './create-api';

describe(ApiCreationService.name, () => {
    it('Makes an http call with the proper URL (given passed route params)', () => {
        const fetchPlaceholder: Window["fetch"] = jest.fn()
          .mockReturnValue(Promise.resolve({ json() { return Promise.resolve() } }))
        const extractor: ConstructorParameters<typeof ApiCreationService>[1] = {
            extractRouteParams() { return { testId: 123 } },
            extractBody() { return {} },
            extractHeaders() { return {} },
            extractQueryParams() { return { debugMode: true } },
        };
        const service = new ApiCreationService(fetchPlaceholder, extractor);
        const api = service.createApi({
          fetchTest: {
            method: "get",
            url: "/thing/:testId",
            response: Type<any>(),
            request: {
              testId: new RouteParamUnwrap("testId"),
              debugMode: new RequestParamUnwrap("debugMode")
            }
        }}, { baseUrl: "" });

        api.fetchTest({ testId: 123, debugMode: true });
        expect(fetchPlaceholder)
          .toHaveBeenCalledWith('/thing/123?debugMode=true', {
            headers: {},
            method: "get"
          })
    });

})
