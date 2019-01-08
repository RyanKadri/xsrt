import { LocationMetadata } from "../../../scraper/types/types";

export const formatPlayerTime = (timeInMillis: number) => {
    const seconds = Math.round(timeInMillis / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${ pad(minutes) }:${ pad(seconds % 60) }`;
}

export const formatDuration = (timeInMillis: number, truncateMinor = false) => {
    let numSeconds = Math.floor(timeInMillis / 1000);
    let numMinutes = Math.floor(numSeconds / 60);
    numSeconds -= numMinutes * 60;
    let numHours = Math.floor(numMinutes / 60);
    numMinutes -= numHours * 60;
    const hourPart = numHours > 0 ? `${numHours} hours ` : '';
    const minutePart = numMinutes > 0 ? `${numMinutes} minutes ` : '';
    const secondsPart = numSeconds > 0 ? `${numSeconds} seconds`: '';
    return truncateMinor
        ? hourPart || minutePart || secondsPart
        : `${hourPart}${minutePart}and ${secondsPart}`
}

export const formatDate = (timeStamp: number) => {
    return new Date(timeStamp).toLocaleDateString('en-US');
} 

export const fullUrl = (location: LocationMetadata) =>
    `${ location.protocol }//${shortUrl(location)}`;

export const shortUrl = (location: LocationMetadata) =>
    `${ location.hostname }${ formatPort(location) }${ location.path }`;

const formatPort = (location: LocationMetadata) => !!location.port ? `:${location.port}`: ''

const pad = (num: number) => {
    return String(num).padStart(2, '0')
}