import { RecordingChunk } from "../types/types";
import { defineEndpoint, RequestBodyUnwrap, RouteParamUnwrap, Type, RequestHeader } from "./types";

export const chunkApiSymbol = Symbol("chunkApi");
export const chunkEndpointMetadata = defineEndpoint({
  createChunk: {
    method: "post",
    url: "/api/recordings/:recordingId/chunks",
    request: {
      chunk: new RequestBodyUnwrap<Omit<RecordingChunk, "uuid">>(),
      recordingId: new RouteParamUnwrap("recordingId"),
    },
    clientHeaders: {
      userAgent: new RequestHeader("user-agent")
    },
    response: Type<{ uuid: string }>()
  },
  fetchChunk: {
    method: "get",
    url: "/chunks/:chunkId",
    request: {
      chunkId: new RouteParamUnwrap("chunkId")
    },
    response: Type<RecordingChunk>()
  },
});
