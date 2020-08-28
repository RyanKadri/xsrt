import { InjectionParamMap, Interface, mapDictionary, RequestUnwrapper, UrlVerbDefinition, PayloadVerbDefinition } from "../../../common/src";
import { Request, Response } from "express";
import { injectable } from "inversify";
import { HttpResponseCodes } from "./http-codes";
import { ExplicitResponse, MethodImplementation, ResponseHeader } from "./route-types";

@injectable()
export class RequestHandler {
  async handle(
    def: UrlVerbDefinition<any> | PayloadVerbDefinition<any>,
    implementation: MethodImplementation<any>,
    req: Interface<Request>,
    resp: Interface<Response>
  ) {
    try {
      await this.attemptHandle({ ...def.clientHeaders, ...def.request }, implementation, req, resp);
    } catch (e) {
      resp.status(HttpResponseCodes.INTERNAL_SERVER_ERROR)
        .json({ error: e.message });
    }
  }

  private async attemptHandle(
    requestDef: InjectionParamMap,
    implementation: MethodImplementation<any>,
    req: Interface<Request>,
    resp: Interface<Response>
  ) {
    const injected = mapDictionary(
      requestDef,
      (injector: RequestUnwrapper<any>) => injector.read(req)
    );

    const res = await implementation(injected as any);
    if (res instanceof ExplicitResponse) {
      const response = res.response;
      if (response.headers) {
        response.headers.forEach(({ name, value }) => {
          resp.setHeader(name, value);
        });
      }
      if (response.type === "success") {
        resp.json(response.payload);
      } else if (response.type === "error") {
        resp.status(response.code).json({ error: response.message });
      } else if (response.type === "buffer") {
        resp.send(response.data)
      }
    } else {
      resp.json(res);
    }
  }
}

export const successResponse = <C>(payload: C, headers: ResponseHeader[] = []) => {
  return new ExplicitResponse({ type: "success", payload, headers });
};

export const errorResponse = (code: number, message: string, headers: ResponseHeader[] = []) => {
  return new ExplicitResponse<any>({ type: "error", code, message, headers });
};

export const errorNotFound = errorResponse.bind(undefined, HttpResponseCodes.CONTENT_NOT_FOUND);
export const errorInvalidCommand = errorResponse.bind(undefined, HttpResponseCodes.INVALID_COMMAND);
export const errorNotAuthorized = errorResponse.bind(undefined, HttpResponseCodes.NOT_AUTHORIZED);

export const bufferResponse = (data: any, headers: ResponseHeader[]) => {
  return new ExplicitResponse<any>({ type: "buffer", data, headers });
};
