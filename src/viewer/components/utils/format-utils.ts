import { LocationMetadata } from "@scraper/traverse/extract-metadata";

export const formatDuration = (timeInMillis: number) => {
    const seconds = Math.round(timeInMillis / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${ pad(minutes) }:${ pad(seconds % 60) }`;
}

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

const pad = (num: number) => {
    return String(num).padStart(2, '0')
}