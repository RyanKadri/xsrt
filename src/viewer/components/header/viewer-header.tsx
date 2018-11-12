import React from "react";
import { LocationMetadata, InitMetadata } from "../../../scraper/traverse/extract-metadata";
import './viewer-header.css';

export const RecordingHeader = ({metadata}: {metadata: InitMetadata}) =>
    <header>
        Viewing snapshot from 
        <small className="date">{ formatDate(metadata.startTime) }</small>
        <a target="_blank" href={ fullUrl(metadata.url) } className="url">{ shortUrl(metadata.url) }</a>
    </header>;

export const formatDate = (timeStamp: number) => new Date(timeStamp).toLocaleDateString('en-US');

export const fullUrl = (location: LocationMetadata) =>
    `${ location.protocol }//${shortUrl(location)}`;

export const shortUrl = (location: LocationMetadata) =>
    `${ location.hostname }${ formatPort(location) }${ location.path }`;

const formatPort = (location: LocationMetadata) => !!location.port ? `:${location.port}`: ''