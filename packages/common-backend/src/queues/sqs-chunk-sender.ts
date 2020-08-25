import SQS from "aws-sdk/clients/sqs";
import { inject, injectable } from "inversify";
import { RecordingChunk, SQSConnectionSymbol } from "../../../common/src";
import { QueueInfo, QueueSender } from "./queue-metadata";
import { IServerConfig, ServerConfig } from "../server/express-server";

@injectable()
export class SQSChunkSender implements QueueSender<RecordingChunk> {
  constructor(
    @inject(IServerConfig) private config: ServerConfig,
    @inject(SQSConnectionSymbol) private sqs: SQS
  ) { }

  async post(chunk: RecordingChunk, queueInfo: QueueInfo): Promise<void> {
    return this.postMessage(this.config[queueInfo.sqs.queuePath] as string, { uuid: chunk.uuid });
  }

  private async postMessage(toQueue: string, payload: any) {
    try {
      await this.sqs.sendMessage({
        MessageBody: JSON.stringify(payload),
        QueueUrl: toQueue
      }).promise();
    } catch(e) {
      console.error(`Failed to send message: ${e.message}`)
    }
  }

}
