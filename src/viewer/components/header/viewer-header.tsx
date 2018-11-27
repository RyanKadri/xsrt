import React from "react";
import { RecordingMetadata } from "../../../scraper/traverse/extract-metadata";
import './viewer-header.css';

export const RecordingHeader = ({metadata}: {metadata: RecordingMetadata}) =>
    <header>
        <a target="_blank" href={ metadata.url } className="url">{ metadata.url }</a>
        <small className="date">{ formatDate(metadata.startTime) }</small>
    </header>;

let cachedDate;
export const formatDate = (timeStamp: number) => {
    if(cachedDate) {
        return cachedDate
    } else {
        return cachedDate = new Date(timeStamp).toLocaleDateString('en-US');
    }
} 