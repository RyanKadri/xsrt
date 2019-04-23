import { ServerConfig, ExpressConfigurator } from "@xsrt/common-backend";
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
    readonly rabbitHost = process.env.RABBIT_HOST || "localhost";
    readonly elasticUrl = process.env.ELASTIC_HOST || "localhost:9200";
}

// TODO - Refactoring this out to a common module will simplify dependencies and reduce duplication
@injectable()
export class ApiServerInitializer implements ExpressConfigurator {
    async initialize(app: Express) {
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json({ limit: "10mb", inflate: true })); // TODO - Let's think about security...
        app.use(bodyParser.text({ limit: "10mb" }));
        // TODO - Limit this
        app.use(cors());
        app.options("*", cors());
    }
}
