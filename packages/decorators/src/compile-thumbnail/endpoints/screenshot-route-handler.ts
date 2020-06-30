import { RouteHandler } from "@xsrt/common-backend";
import { Router, static as expressStatic } from "express";
import { injectable } from "inversify";

@injectable()
export class ScreenshotStaticRouteHandler implements RouteHandler {
    readonly base = "/static/screenshot";

    decorateRouter(router: Router): void {
      console.log("static")
        router.use(expressStatic("../../dist/bootstrap"));
    }

}
