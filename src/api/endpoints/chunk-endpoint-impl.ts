import { Chunk } from '../../common/db/chunk';
import { Recording } from '../../common/db/recording';
import { RecordingChunk } from '../../scraper/types/types';
import { chunkEndpoint } from './chunk-endpoint-metadata';
import { errorNotFound, implement, RouteImplementation } from './route';

export const chunkEndpointImplementation = implement(chunkEndpoint, {
    createChunk: (async ({ chunk, recordingId }) => {
        const savedChunk = await new Chunk(chunk).save();
        const doc = await Recording.findByIdAndUpdate(recordingId, { 
            $push: { chunks: savedChunk._id } 
        });
        if(!doc) {
            return errorNotFound(`Could not find recording ${recordingId}`);
        } else {
            return { _id: savedChunk!._id }
        }
    }),
    fetchChunk: (async ({ chunkId }) => {
        const res = await Chunk.findById(chunkId)
        if(res) {
            const test = { inputs: {}, ...(res.toObject() as RecordingChunk) };;
            return test
        } else {
            return errorNotFound(`Could not find chunk ${chunkId }`)
        }
    })
} as RouteImplementation<typeof chunkEndpoint>)