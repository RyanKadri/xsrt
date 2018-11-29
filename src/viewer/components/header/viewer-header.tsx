import React from "react";
import { LocationMetadata, RecordingMetadata } from "../../../scraper/traverse/extract-metadata";
import './viewer-header.css';

export const RecordingHeader = ({metadata}: {metadata: RecordingMetadata}) =>
    <header>
        <a target="_blank" href={ fullUrl(metadata.url) } className="url">{ shortUrl(metadata.url) }</a>
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

export const fullUrl = (location: LocationMetadata) =>
    `${ location.protocol }//${shortUrl(location)}`;

export const shortUrl = (location: LocationMetadata) =>
    `${ location.hostname }${ formatPort(location) }${ location.path }`;

const formatPort = (location: LocationMetadata) => !!location.port ? `:${location.port}`: ''