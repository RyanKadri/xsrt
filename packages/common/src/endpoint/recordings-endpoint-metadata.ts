import { Recording, RecordingOverview } from "../types/types";
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
    response: Type<void>()
  },
  filterRecordings: {
    url: multiRecordingUrl,
    method: "get",
    request: {
      target: new RequestParamUnwrap("target"),
      before: new RequestParamUnwrap("before"),
      after: new RequestParamUnwrap("after"),
      url: new RequestParamUnwrap("url")
    },
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
      referer: new RequestHeader("Referer")
    },
    response: Type<{ uuid: string }>()
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
  ids: number[];
}
