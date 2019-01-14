import { defineEndpoint, RequestBodyUnwrap, RouteParamUnwrap, Type } from "../../common/server/route-types";
import { Without } from "../../common/utils/type-utils";
import { RecordingChunk } from "../../scraper/types/types";

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
