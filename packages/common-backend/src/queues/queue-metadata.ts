export const rawChunkQueue: QueueMetadata = {
    name: "RawChunks"
};

export const initSnapshotQueue: QueueMetadata = {
    name: "SnapshotChunks"
};

export interface QueueMetadata {
    name: string;
}
