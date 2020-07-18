import { Request, Response } from "express";
import { RequestHandler } from './request-handler';

describe(RequestHandler.name, () => {
    it('Returns a 500 error if the underlying implementation throws', async () => {
        const service = new RequestHandler();
        const response = mockResponse();
        await service.handle({ } as any, () => { throw new Error("Bad!")}, mockRequest(), response);
        expect(response.status).toHaveBeenCalledWith(500);
    });
})

function mockRequest() {
    return {
        body: "test"
    } as Request
}

function mockResponse() {
    return {
        json: undefined,
        status: jest.fn(() => ({ json: jest.fn() }))
    } as unknown as Response
}
