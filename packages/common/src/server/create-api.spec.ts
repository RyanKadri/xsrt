import { AxiosResponse, AxiosStatic } from "got";
import { RequestParamUnwrap, RouteParamUnwrap, Type } from "../endpoint/types";
import { ApiRequestPartExtractor } from "./api-request-extractor";
import { ApiCreationService } from './create-api';

describe(ApiCreationService.name, () => {
    it('Makes an http call with the proper URL (given passed route params)', () => {
        const responsePlaceholder = jasmine.createSpyObj<AxiosResponse>("resp", { data: true })
        const mockAxios = jasmine.createSpyObj<AxiosStatic>("Axios", { get: Promise.resolve(responsePlaceholder) });
        const extractor = jasmine.createSpyObj<ApiRequestPartExtractor>("apiCreator", {
            extractRouteParams: { testId: 123 },
            extractBody: {},
            extractHeaders: {},
            extractQueryParams: { debugMode: true }
        });
        const service = new ApiCreationService(mockAxios, extractor, { backendUrl: "" });
        const api = service.createApi({ fetchTest: { method: "get", url: "/thing/:testId", response: Type<any>(),
            request: { testId: new RouteParamUnwrap("testId"), debugMode: new RequestParamUnwrap("debugMode") }
        }});
        api.fetchTest({ testId: 123, debugMode: true });
        expect(mockAxios.get).toHaveBeenCalledWith('/api/thing/123', { params: { debugMode: true }, headers: {} } )
    });

})
