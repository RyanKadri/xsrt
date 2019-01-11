import { LocationMetadata } from "../../../scraper/types/types";

const millisPerSec = 1000;
const secondsPerMin = 60;
const minsPerHour = 60;

export const formatPlayerTime = (timeInMillis: number) => {
    const seconds = Math.round(timeInMillis / millisPerSec);
    const minutes = Math.floor(seconds / secondsPerMin);
    return `${ pad(minutes) }:${ pad(seconds % secondsPerMin) }`;
};

export const formatDuration = (timeInMillis: number, truncateMinor = false) => {
    let numSeconds = Math.floor(timeInMillis / millisPerSec);
    let numMinutes = Math.floor(numSeconds / secondsPerMin);
    numSeconds -= numMinutes * secondsPerMin;
    const numHours = Math.floor(numMinutes / minsPerHour);
    numMinutes -= numHours * minsPerHour;
    const hourPart = numHours > 0 ? `${numHours} hours ` : "";
    const minutePart = numMinutes > 0 ? `${numMinutes} minutes ` : "";
    const secondsPart = numSeconds > 0 ? `${numSeconds} seconds` : "";
    return truncateMinor
        ? hourPart || minutePart || secondsPart
        : `${hourPart}${minutePart}and ${secondsPart}`;
};

export const formatDate = (timeStamp: number) => {
    return new Date(timeStamp).toLocaleDateString("en-US");
};

export const fullUrl = (location: LocationMetadata) =>
    `${ location.protocol }//${shortUrl(location)}`;

export const shortUrl = (location: LocationMetadata) =>
    `${ location.hostname }${ formatPort(location) }${ location.path }`;

const formatPort = (location: LocationMetadata) => !!location.port ? `:${location.port}` : "";

const pad = (num: number) => {
    return String(num).padStart(2, "0");
};
