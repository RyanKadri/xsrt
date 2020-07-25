import { Channel } from "amqplib";
import { inject, injectable } from "inversify";
import { RabbitChannelSymbol, RecordingChunk } from "../../../common/src";
import { QueueInfo, QueueSender } from "./queue-metadata";

// This class is pretty trivial. Is it needed?
@injectable()
export class RabbitChunkSender implements QueueSender<RecordingChunk> {
  static diName = "queueService";

  constructor(
    @inject(RabbitChannelSymbol) private channel: Channel
  ) { }

  async post(chunk: RecordingChunk, queueInfo: QueueInfo): Promise<void> {
    this.postMessage(queueInfo.mq.name, { uuid: chunk.uuid });
  }

  private postMessage(toQueue: string, payload: any) {
    this.channel.sendToQueue(toQueue, Buffer.from(JSON.stringify(payload)));
  }

}
