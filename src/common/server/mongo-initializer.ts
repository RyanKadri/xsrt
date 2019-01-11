import { inject, injectable } from "inversify";
import { connect } from "mongoose";
import { LoggingService } from "../utils/log-service";
import { IServerConfig, ServerConfig, ServerInitializer } from "./express-server";

@injectable()
export class MongoInitializer implements ServerInitializer {

    constructor(
        @inject(IServerConfig) private config: ServerConfig,
        private logger: LoggingService
    ) {}

    async initialize() {
        try {
            await connect(this.config.mongoUrl, { useNewUrlParser: true });
        } catch (e) {
            this.logger.error(`Error connecting to Mongo ${e.message}`);
            throw e;
        }
    }
}
