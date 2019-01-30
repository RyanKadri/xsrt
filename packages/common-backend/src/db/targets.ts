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
    identifiedBy: {
        type: String,
        required: true,
        enum: ["host"]
    },
    identifier: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
}, { strict: true, collection: "targets" });

export const Target = model("Target", siteSchema);
