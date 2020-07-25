import SQS from "aws-sdk/clients/sqs";
import { inject, injectable } from "inversify";
import { RecordingChunk, SQSConnectionSymbol } from "../../../common/src";
import { IServerConfig, ServerConfig } from "../server/express-server";
import { QueueInfo, QueueSender } from "./queue-metadata";

@injectable()
export class SQSChunkSender implements QueueSender<RecordingChunk> {
  constructor(
    @inject(IServerConfig) private config: ServerConfig,
    @inject(SQSConnectionSymbol) private sqs: SQS
  ) { }

  async post(chunk: RecordingChunk, queueInfo: QueueInfo): Promise<void> {
    return this.postMessage(queueInfo.sqs.queuePath, { uuid: chunk.uuid });
  }

  private async postMessage(toQueue: string, payload: any) {
    try {
      await this.sqs.sendMessage({
        MessageBody: JSON.stringify(payload),
        QueueUrl: this.config.sqsBaseUrl + "/" + toQueue
      }).promise();
    } catch(e) {
      console.error(`Failed to send message: ${e.message}`)
    }
  }

}
