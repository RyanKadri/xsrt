import { model, Schema } from "mongoose";
import shortid from "shortid";
import { Without } from "../utils/type-utils";

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

export interface SiteTarget {
    _id: string;
    name: string;
    identifiedBy: "host";
    identifier: string;
    url: string;
}

export type NewSiteTarget = Without<SiteTarget, "_id">;
