import { Chunk } from '../../common/db/chunk';
import { Recording } from '../../common/db/recording';
import { multiChunkRoute, singleChunkRoute } from './chunk-endpoint-metadata';
import { ErrorResponse, implement, SuccessResponse } from './route';

export const chunkEndpointImplementation = implement(multiChunkRoute, {
    post: async ({ chunk, recordingId }) => {
        const savedChunk = await new Chunk(chunk).save();
        const doc = await Recording.findByIdAndUpdate(recordingId, { 
            $push: { chunks: savedChunk._id } 
        });
        if(!doc) {
            return new ErrorResponse(404, `Could not find recording ${recordingId}`);
        } else {
            return new SuccessResponse({ _id: savedChunk!._id })
        }
    }
})

export const singleChunkEndpointImpl = implement(singleChunkRoute, {
    get: async ({ chunkId }) => {
        const res = await Chunk.findById(chunkId)
        if(res) {
            return new SuccessResponse({ inputs: {}, ...res.toObject() });
        } else {
            return new ErrorResponse(404, `Could not find chunk ${chunkId }`)
        }
    }
})