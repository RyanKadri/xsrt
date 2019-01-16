import { Request, Response } from "express";
import { RequestHandler } from './request-handler';

describe(RequestHandler.name, () => {
    it('Returns a 500 error if the underlying implementation throws', async (done) => {
        const service = new RequestHandler();
        const response = mockResponse();
        await service.handle({ }, () => { throw new Error("Bad!")}, mockRequest(), response);
        expect(response.status).toHaveBeenCalledWith(500);
        done();
    });


})

function mockRequest() {
    return jasmine.createSpyObj<Request>("request", {
        body: "test"
    })
}

function mockResponse() {
    return jasmine.createSpyObj<Response>("response", {
        json: undefined,
        status: jasmine.createSpyObj<Response>("inner", { json: undefined })
    })
}
