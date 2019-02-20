import { Recording, RecordingOverview } from "../types/types";
import { DeepPartial } from "../utils/type-utils";
import { defineEndpoint, RequestBodyUnwrap, RequestHeader, RequestParamUnwrap, RouteParamUnwrap, Type } from "./types";

const recordingIdParam = "recordingId";
const singleRecordingUrl = `/recordings/:${recordingIdParam}`;
const multiRecordingUrl = `/recordings`;
const recordingId = new RouteParamUnwrap(recordingIdParam);

export const recordingApiSymbol = Symbol("recordingApi");
export const recordingEndpoint = defineEndpoint({
    fetchRecording: {
        method: "get",
        url: singleRecordingUrl,
        request: {
            recordingId
        },
        response: Type<Recording>()
    },
    deleteRecording: {
        method: "delete",
        url: singleRecordingUrl,
        request: {
            recordingId
        },
        response: Type<Recording>()
    },
    patchRecording: {
        method: "patch",
        url: singleRecordingUrl,
        request: {
            recordingId,
            patchData: new RequestBodyUnwrap<DeepPartial<Recording>>()
        },
        response: Type<{success: boolean}>()
    },
    filterRecordings: {
        url: multiRecordingUrl,
        method: "get",
        request: { site: new RequestParamUnwrap("site") },
        response: Type<RecordingOverview[]>()
    },
    createRecording: {
        method: "post",
        url: multiRecordingUrl,
        request: {
            recording: new RequestBodyUnwrap<CreateRecordingRequest>(),
        },
        clientHeaders: {
            userAgent: new RequestHeader("user-agent"),
            host: new RequestHeader("Host")
        },
        response: Type<{ _id: string }>()
    },
    deleteMany: {
        method: "post",
        url: "/recordings/delete-many",
        request: { deleteRequest: new RequestBodyUnwrap<DeleteManyRecordingsRequest>() },
        response: Type<{ success: boolean }>()
    }
});

export interface CreateRecordingRequest {
    site: string;
    startTime: number;
}

export interface DeleteManyRecordingsRequest {
    ids: string[];
}
