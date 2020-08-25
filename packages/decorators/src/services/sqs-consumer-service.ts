import SQS from "aws-sdk/clients/sqs";
import { inject, injectable, multiInject } from "inversify";
import { IChunkSender, QueueInfo, QueueSender, SQSInfo, ServerConfig, IServerConfig } from "../../../common-backend/src";
import { NeedsInitialization, RecordingChunk, SQSConnectionSymbol } from "../../../common/src";
import { IDecoratorConsumer } from "../di.decorators";

@injectable()
export class SQSConsumerService implements NeedsInitialization {

  private handlers = new Map<string, QueueMessageCallback<any>[]>();

  constructor(
    @inject(IServerConfig) private config: ServerConfig,
    @inject(SQSConnectionSymbol) private sqs: SQS,
    @inject(IChunkSender) private queueService: QueueSender<RecordingChunk>,
    @multiInject(IDecoratorConsumer) private listeners: DecoratorConsumer<any>[]
  ) { }

  async initialize() {
    await Promise.all(
      this.listeners.map(listener =>
        this.registerListener(listener.topic.sqs, listener.handle.bind(listener))
      )
    );
    Array.from(this.handlers.keys()).forEach(queue => this.listenQueue(queue))
  }

  private async registerListener<T>(topic: SQSInfo, handler: QueueMessageCallback<T>) {
    const queuePath = this.config[topic.queuePath] as string;
    const oldCallbacks = this.handlers.get(queuePath);
    this.handlers.set(queuePath, (oldCallbacks || []).concat(handler));
  }

  private async listenQueue(queuePath: string) {
    const finalQueueUrl = queuePath;
    try {
      const resp = await this.sqs.receiveMessage({
        QueueUrl: finalQueueUrl,
        VisibilityTimeout: 10,
        MessageAttributeNames: ["All"],
        WaitTimeSeconds: 10
      }).promise()
      if (resp.Messages !== undefined) {
        const callbacks = this.handlers.get(queuePath) || [];
        for(const message of resp.Messages) {
          const value = message.Body!;
          const responses = await Promise.all(
            callbacks.map(cb => cb(JSON.parse(value)))
          );
          responses.forEach(resp => {
            if (resp) { this.forwardResponse(resp); }
          });
          await this.sqs.deleteMessage({
            QueueUrl: finalQueueUrl,
            ReceiptHandle: message.ReceiptHandle!
          }).promise()
        }
      }
    } catch (e) {
      console.error(e)
    }
    this.listenQueue(queuePath)
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
