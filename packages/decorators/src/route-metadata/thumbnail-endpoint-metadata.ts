import { defineEndpoint, RouteParamUnwrap, SnapshotChunk, Type } from "@xsrt/common";

export const thumbnailEndpointMetadata = defineEndpoint({
    getThumbnailData: {
        method: "get",
        url: "/thumbnails/:recordingId/data",
        response: Type<SnapshotChunk>(),
        request: {
            recordingId: new RouteParamUnwrap("recordingId")
        }
    },
    deleteThumbnail: {
        method: "delete",
        url: "/thumbnails/:recording",
        response: Type<{success: boolean}>(),
        request: {
            recordingId: new RouteParamUnwrap("recordingId")
        }
    }
});
