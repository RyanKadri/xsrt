import { model, Schema } from "mongoose";
import shortid from "shortid";

const siteSchema = new Schema({
    _id: {
        type: String,
        default: shortid.generate
    },
    name: {
        type: String,
        required: true
    },
    urls: {
        type: [String],
        required: false,
        default: []
    },
    wildcardUrl: {
        type: Boolean,
        required: false,
        default: false
    }

}, { strict: true, collection: "targets" });

export const Target = model("Target", siteSchema);
