import { Schema, model } from "mongoose";
import shortid from "shortid";

const recordingSchema = new Schema({
    _id: {
        type: String,
        default: shortid.generate
    }
}, { strict: false, collection: "recordings" });

export const Recording = model("Recording", recordingSchema);
