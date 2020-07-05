import { LoggingService, NeedsInitialization } from "@xsrt/common";
import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import { IServerConfig, ServerConfig } from "./express-server";

const retryDelay = 5000;
const maxRetries = 3;

@injectable()
export class MongoInitializer implements NeedsInitialization {

  private numRetries = 0;
  constructor(
    @inject(IServerConfig) private config: ServerConfig,
    private logger: LoggingService
  ) { }

  async initialize() {
    await this.connectWithRetry();
  }

  private connectWithRetry(): Promise<void> {
    this.logger.info(`Mongo URL: "${this.config.mongoUrl}"`);
    mongoose.set("useUnifiedTopology", true);

    return mongoose.connect(this.config.mongoUrl, { useNewUrlParser: true, })
      .then(() => {
        this.logger.info(`Successfully connected to Mongo`);
      }).catch(err => {
        this.logger.error(`Error connecting to Mongo: ${err}`);
        if (this.numRetries++ < maxRetries) {
          return new Promise(res => setTimeout(() => this.connectWithRetry().then(res), retryDelay));
        } else {
          throw new Error("Failed to connect to Mongo");
        }
      });
  }
}
