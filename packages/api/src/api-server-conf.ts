import { ServerConfig, ServerInitializer } from "@xsrt/common-backend";
import bodyParser from "body-parser";
import cors from "cors";
import { Express } from "express";
import { injectable } from "inversify";

@injectable()
export class ApiServerConfig implements ServerConfig {
    readonly port = parseInt(process.env.API_PORT!, 10);
    readonly mongoUrl = `${process.env.MONGO_URL}`;
    readonly decorateUrl = `${process.env.DECORATOR_URL}`;
    readonly assetDir = `${process.env.STORAGE_LOCATION}/assets`;
}

@injectable()
export class ApiServerInitializer implements ServerInitializer {
    async initialize(app: Express) {
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json({ limit: "10mb", inflate: true })); // TODO - Let's think about security...
        app.use(bodyParser.text({ limit: "10mb" }));
        app.use(cors());
        app.options("*", cors());
    }
}
