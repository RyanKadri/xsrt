export const rawChunkQueueInfo: QueueInfo = {
  mq: {
    name: "RawChunks"
  },
  sqs: {
    queuePath: "xsrt-raw-chunks"
  }
};

export const initSnapshotQueueInfo: QueueInfo = {
  mq: {
    name: "SnapshotChunks"
  },
  sqs: {
    queuePath: "xsrt-snapshot-chunks"
  }
};

export const elasticQueueInfo: QueueInfo = {
  mq: {
    name: "ElasticQueue"
  },
  sqs: {
    queuePath: "xsrt-elastic"
  }
};

export interface QueueSender<T> {
  post(message: T, queueInfo: QueueInfo): Promise<void>
}

export interface QueueInfo {
  sqs: SQSInfo;
  mq: MQInfo
}

export interface MQInfo {
  name: string;
}

export interface SQSInfo {
  queuePath: string;
}

export const IChunkSender = Symbol("ChunkSender");
