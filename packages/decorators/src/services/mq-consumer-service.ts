import { Channel } from "amqplib";
import { inject, injectable, multiInject } from "inversify";
import { IChunkSender, QueueInfo, QueueSender } from "../../../common-backend/src";
import { NeedsInitialization, RabbitChannelSymbol, RecordingChunk } from "../../../common/src";
import { IDecoratorConsumer } from "../di.decorators";

@injectable()
export class MQConsumerService implements NeedsInitialization {

  private handlers = new Map<string, QueueMessageCallback<any>[]>();

  constructor(
    @inject(RabbitChannelSymbol) private channel: Channel,
    @inject(IChunkSender) private queueService: QueueSender<RecordingChunk>,
    @multiInject(IDecoratorConsumer) private listeners: DecoratorConsumer<any>[]
  ) { }

  async initialize() {
    await Promise.all(
      this.listeners.map(listener =>
        this.registerListener(listener.topic.mq.name, listener.handle.bind(listener))
      )
    );
  }

  private async registerListener<T>(topic: string, handler: QueueMessageCallback<T>) {
    const oldCallbacks = this.handlers.get(topic);
    this.handlers.set(topic, (oldCallbacks || []).concat(handler));

    await this.channel.consume(topic, async (msg) => {
      if (msg === null) { return; }
      const callbacks = this.handlers.get(topic) || [];
      const value = msg.content.toString();
      const responses = await Promise.all(
        callbacks.map(cb => cb(JSON.parse(value)))
      );
      responses.forEach(resp => {
        if (resp) { this.forwardResponse(resp); }
      });
      this.channel.ack(msg);
    });
  }

  // TODO - Handle failures here
  private async forwardResponse(resp: QueueForwardRequest) {
    this.queueService.post(resp.payload, resp.queue);
  }
}

export type QueueMessageCallback<T> = (msg: T) => Promise<QueueForwardRequest | void>;

export interface DecoratorConsumer<T> {
  topic: QueueInfo;
  handle: QueueMessageCallback<T>;
}

export interface QueueForwardRequest {
  queue: QueueInfo;
  payload: any;
}

export type ChunkId = Pick<RecordingChunk, "uuid">;
