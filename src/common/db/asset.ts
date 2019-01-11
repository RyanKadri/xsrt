import { Schema, model } from "mongoose";
import shortid from "shortid";

const assetSchema = new Schema({
    _id: {
        type: String,
        default: shortid.generate
    },
    url: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true,
    },
    headers: {
        type: [{
            name: {
                type: String,
                required: true
            },
            value: {
                type: String,
                required: true
            }
        }]
    },
    content: {
        type: String,
        required: true
    }
}, { strict: true, collection: "assets" });

export const Asset = model("Asset", assetSchema);

export interface ProxiedAsset {
    _id: string;
    url: string;
    hash: string;
    headers: ProxyHeader[];
    content: string;
}

export interface ProxyHeader {
    name: string;
    value: string;
}
