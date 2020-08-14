import { ServerConfig } from "../server/express-server";

export const rawChunkQueueInfo: QueueInfo = {
  mq: {
    name: "RawChunks"
  },
  sqs: {
    queuePath: "rawChunkUrl"
  }
};

export const initSnapshotQueueInfo: QueueInfo = {
  mq: {
    name: "SnapshotChunks"
  },
  sqs: {
    queuePath: "snapshotQueueUrl"
  }
};

export const elasticQueueInfo: QueueInfo = {
  mq: {
    name: "ElasticQueue"
  },
  sqs: {
    queuePath: "elasticQueueUrl"
  }
};

export interface QueueSender<T> {
  post(message: T, queueInfo: QueueInfo): Promise<void>
}

export interface QueueInfo {
  mq: MQInfo
  sqs: SQSInfo
}

export interface MQInfo {
  name: string;
}

export interface SQSInfo {
  queuePath: keyof ServerConfig;
}

export const IChunkSender = Symbol("ChunkSender");
