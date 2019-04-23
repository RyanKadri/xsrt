export const recordingRepo: ElasticRepo = {
    index: "recordings",
    type: "recordings"
};

export interface ElasticRepo {
    index: string;
    type: string;
}
