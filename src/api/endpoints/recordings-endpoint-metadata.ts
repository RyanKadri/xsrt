import { IServerConfig } from '../../common/server/express-server';
import { DeepPartial } from '../../common/utils/type-utils';
import { LocationMetadata, Recording, RecordingOverview } from '../../scraper/types/types';
import { defineRoute, RequestBodyUnwrap, RequestHeader, RequestParamUnwrap, RouteParamUnwrap, Type } from './route';

const recordingIdParam = "recordingId";
const recordingId = new RouteParamUnwrap(recordingIdParam)
export const singleRecordingMetadata = defineRoute({
    url: `/recordings/:${recordingIdParam}`,
    get: {
        request: {
            recordingId
        },
        response: Type<Recording>()
    },
    delete: {
        request: {
            recordingId
        },
        response: Type<Recording>()
    },
    patch: {
        request: {
            recordingId,
            patchData: new RequestBodyUnwrap<DeepPartial<Recording>>(),
            config: IServerConfig
        },
        response: Type<{success: boolean}>()
    },
})

export const multiRecordingMetadata = defineRoute({
    url: `/recordings`,
    get: {
        request: { site: new RequestParamUnwrap("site") },
        response: Type<RecordingOverview[]>()
    },
    post: {
        request: {
            recording: new RequestBodyUnwrap<CreateRecordingRequest>(),
            userAgent: new RequestHeader("user-agent")
        },
        response: Type<{ _id: string }>()
    }
})

export const recordingMultiDeleteMetadata = defineRoute({
    url: "/recordings/delete-many",
    post: {
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