import { RecordingChunk } from '../../scraper/types/types';
import { defineEndpoint, RequestBodyUnwrap, RouteParamUnwrap, Type } from './route';

export const chunkEndpoint = defineEndpoint({
    createChunk: {
        method: 'post',
        url: '/recordings/:recordingId/chunks',
        request: {
            chunk: new RequestBodyUnwrap<RecordingChunk>(),
            recordingId: new RouteParamUnwrap('recordingId'),
        },
        response: Type<{ _id: string}>()
    },
    fetchChunk: {
        method: 'get',
        url: '/chunks/:chunkId',
        request: {
            chunkId: new RouteParamUnwrap('chunkId')
        },
        response: Type<RecordingChunk>()
    },
});
