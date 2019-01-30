import { RecordingChunk } from "../types/types";
import { Without } from "../utils/type-utils";
import { defineEndpoint, RequestBodyUnwrap, RouteParamUnwrap, Type } from "./types";

export const chunkApiSymbol = Symbol("chunkApi");
export const chunkEndpointMetadata = defineEndpoint({
    createChunk: {
        method: "post",
        url: "/recordings/:recordingId/chunks",
        request: {
            chunk: new RequestBodyUnwrap<Without<RecordingChunk, "_id">>(),
            recordingId: new RouteParamUnwrap("recordingId"),
        },
        response: Type<{ _id: string}>()
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
