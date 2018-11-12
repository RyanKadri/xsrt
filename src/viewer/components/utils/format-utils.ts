export const formatDuration = (timeInMillis: number) => {
    const seconds = Math.round(timeInMillis / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${ pad(minutes) }:${ pad(seconds % 60) }`;
}

const pad = (num: number) => {
    return String(num).padStart(2, '0')
}