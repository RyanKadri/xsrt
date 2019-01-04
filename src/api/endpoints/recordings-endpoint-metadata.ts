import { IServerConfig } from '../../common/server/express-server';
import { DeepPartial } from '../../common/utils/type-utils';
import { LocationMetadata, Recording } from '../../scraper/types/types';
import { defineRoute, RequestBodyUnwrap, RequestHeader, RequestParamUnwrap, RouteParamUnwrap } from './route';

const recordingIdParam = "recordingId";
const recordingId = new RouteParamUnwrap(recordingIdParam)
export const singleRecordingMetadata = defineRoute({
    url: `/recordings/:${recordingIdParam}`,
    get: {
        request: {
            recordingId
        }
    },
    delete: {
        request: {
            recordingId
        }
    },
    patch: {
        request: {
            recordingId,
            patchData: new RequestBodyUnwrap<DeepPartial<Recording>>(),
            config: IServerConfig
        }
    },
})

export const multiRecordingMetadata = defineRoute({
    url: `/recordings`,
    get: {
        request: { site: new RequestParamUnwrap("site") }
    },
    post: {
        request: {
            recording: new RequestBodyUnwrap<CreateRecordingRequest>(),
            userAgent: new RequestHeader("user-agent")
        }
    }
})

export const recordingMultiDeleteMetadata = defineRoute({
    url: "/recordings/delete-many",
    post: {
        request: { deleteRequest: new RequestBodyUnwrap<DeleteManyRecordingsRequest>() }
    }
})

export interface CreateRecordingRequest {
    url: LocationMetadata;
    startTime: number;
}

export interface DeleteManyRecordingsRequest {
    ids: number[];
}