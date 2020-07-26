import SQS from "aws-sdk/clients/sqs";
import { inject, injectable } from "inversify";
import { LoggingService, NeedsInitialization, SQSConnectionSymbol } from "../../../common/src";
import { IServerConfig, ServerConfig } from "../server/express-server";
import { SQSInfo, elasticQueueInfo, rawChunkQueueInfo, initSnapshotQueueInfo } from "./queue-metadata";

@injectable()
export class SQSInitializer implements NeedsInitialization {

  constructor(
    @inject(IServerConfig) private config: ServerConfig,
    private logger: LoggingService,
  ) { }

  async initialize(): Promise<[symbol, SQS]> {
    const sqs = new SQS({ region: this.config.awsRegion });
    await Promise.all(
      [elasticQueueInfo, rawChunkQueueInfo, initSnapshotQueueInfo].map(info =>
        this.verifyQueue(sqs, info.sqs)
      ))
    this.logger.info("Validated SQS");
    return [SQSConnectionSymbol, sqs]
  }

  private async verifyQueue(sqs: SQS, queue: SQSInfo) {
    const queues = await sqs.listQueues({ QueueNamePrefix: queue.queuePath }).promise();
    if (!queues.$response.data || !queues.$response.data.QueueUrls?.some(url => url.endsWith(queue.queuePath))) {
      throw new Error(`Could not find queue: ${ queue.queuePath }`);
    }
  }
}