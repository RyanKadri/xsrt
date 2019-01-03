import { RecordingChunk } from '../../scraper/types/types';
import { defineRoute, RequestBodyUnwrap, RouteParamUnwrap } from './route';

export const multiChunkRoute = defineRoute({
    url: '/recordings/:recordingId/chunks',
    post: {
        request: {
            chunk: new RequestBodyUnwrap<RecordingChunk>(),
            recordingId: new RouteParamUnwrap('recordingId'),
        }
    }
})

export const singleChunkRoute = defineRoute({
    url: '/chunks/:chunkId',
    get: {
        request: {
            chunkId: new RouteParamUnwrap('chunkId')
        }
    }
})