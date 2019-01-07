import { IServerConfig } from '../../common/server/express-server';
import { DeepPartial } from '../../common/utils/type-utils';
import { LocationMetadata, Recording, RecordingOverview } from '../../scraper/types/types';
import { defineEndpoint, RequestBodyUnwrap, RequestHeader, RequestParamUnwrap, RouteParamUnwrap, Type } from './route';

const recordingIdParam = "recordingId";
const singleRecordingUrl = `/recordings/:${recordingIdParam}`;
const multiRecordingUrl = `/recordings`;
const recordingId = new RouteParamUnwrap(recordingIdParam);

export const recordingEndpoint = defineEndpoint({
    fetchRecording: {
        method: 'get',
        url: singleRecordingUrl,
        request: {
            recordingId
        },
        response: Type<Recording>()
    },
    deleteRecording: {
        method: 'delete',
        url: singleRecordingUrl,
        request: {
            recordingId
        },
        response: Type<Recording>()
    },
    patchRecording: {
        method: 'patch',
        url: singleRecordingUrl,
        request: {
            recordingId,
            patchData: new RequestBodyUnwrap<DeepPartial<Recording>>(),
            config: IServerConfig
        },
        response: Type<{success: boolean}>()
    },
    filterRecordings: {
        url: multiRecordingUrl,
        method: 'get',
        request: { site: new RequestParamUnwrap("site") },
        response: Type<RecordingOverview[]>()
    },
    createRecording: {
        method: 'post',
        url: multiRecordingUrl,
        request: {
            recording: new RequestBodyUnwrap<CreateRecordingRequest>(),
            userAgent: new RequestHeader("user-agent")
        },
        response: Type<{ _id: string }>()
    },
    deleteMany: {
        method: 'post',
        url: "/recordings/delete-many",
        request: { deleteRequest: new RequestBodyUnwrap<DeleteManyRecordingsRequest>() },
        response: Type<{ success: boolean }>()
    }
})

export interface CreateRecordingRequest {
    url: LocationMetadata;
    startTime: number;
}

export interface DeleteManyRecordingsRequest {
    ids: number[];
}