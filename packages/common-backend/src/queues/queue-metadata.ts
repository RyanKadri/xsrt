export const rawChunkQueue: QueueMetadata = {
    name: "RawChunks"
};

export const initSnapshotQueue: QueueMetadata = {
    name: "SnapshotChunks"
};

export const elasticQueue: QueueMetadata = {
    name: "ElasticQueue"
};

export interface QueueMetadata {
    name: string;
}
