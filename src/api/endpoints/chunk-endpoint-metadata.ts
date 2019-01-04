import { RecordingChunk } from '../../scraper/types/types';
import { defineRoute, RequestBodyUnwrap, RouteParamUnwrap, Type } from './route';

export const multiChunkRoute = defineRoute({
    url: '/recordings/:recordingId/chunks',
    post: ({
        request: {
            chunk: new RequestBodyUnwrap<RecordingChunk>(),
            recordingId: new RouteParamUnwrap('recordingId'),
        },
        response: Type<{ _id: string}>()
    })
})

export const singleChunkRoute = defineRoute({
    url: '/chunks/:chunkId',
    get: {
        request: {
            chunkId: new RouteParamUnwrap('chunkId')
        },
        response: Type<RecordingChunk>()
    },
})