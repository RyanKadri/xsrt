import { defineEndpoint, RouteParamUnwrap, SnapshotChunk, Type } from "../../../common/src";

export const thumbnailEndpointMetadata = defineEndpoint({
    getThumbnailData: {
        method: "get",
        url: "/thumbnails/:chunkId/data",
        response: Type<SnapshotChunk>(),
        request: {
            chunkId: new RouteParamUnwrap("chunkId")
        }
    },
    deleteThumbnail: {
        method: "delete",
        url: "/thumbnails/:recordingId",
        response: Type<{success: boolean}>(),
        request: {
            recordingId: new RouteParamUnwrap("recordingId")
        }
    }
});
