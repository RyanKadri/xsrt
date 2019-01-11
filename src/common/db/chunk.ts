import { model, Schema, SchemaTypes } from "mongoose";
import shortid from "shortid";

const chunkSchema = new Schema({
    _id: {
        type: String,
        default: shortid.generate
    },
    metadata: {
        type: {
            startTime: {
                type: Number,
                required: true
            },
            endTime: {
                type: Number,
                required: true
            }
        }
    },
    type: {
        type: String,
        required: true,
        enum: ["diff", "snapshot"]
    },
    snapshot: {
        type: SchemaTypes.Mixed,
        required: false
    },
    assets: [{
        type: SchemaTypes.Mixed,
        required: false
    }],
    changes: [{
        type: SchemaTypes.Mixed,
        required: false
    }],
    inputs: {
        type: SchemaTypes.Mixed,
        required: false,
    }

}, { strict: true, collection: "recordingChunks" });

export const Chunk = model("Chunk", chunkSchema);
