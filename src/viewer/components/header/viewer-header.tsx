import React from "react";
import { LocationMetadata, RecordingMetadata } from "../../../scraper/traverse/extract-metadata";
import { createStyles, withStyles, WithStyles } from "@material-ui/core";

const styles = createStyles({
    header: {
        padding: 12,
        fontSize: '2em',
        color: 'black',
        display: 'flex',
        alignItems: 'center'
    },
    date: {
        marginLeft: 16
    },
    url: {
        marginLeft: 'auto',
        fontSize: '1.5rem'
    }
})
    

const _RecordingHeader = ({metadata, classes}: RecordingHeaderProps) =>
    <header className={ classes.header }>
        <a target="_blank" href={ fullUrl(metadata.url) } className={classes.url}>{ shortUrl(metadata.url) }</a>
        <small className={ classes.date }>{ formatDate(metadata.startTime) }</small>
    </header>;

let cachedDate;
const formatDate = (timeStamp: number) => {
    if(cachedDate) {
        return cachedDate
    } else {
        return cachedDate = new Date(timeStamp).toLocaleDateString('en-US');
    }
} 

const fullUrl = (location: LocationMetadata) =>
    `${ location.protocol }//${shortUrl(location)}`;

const shortUrl = (location: LocationMetadata) =>
    `${ location.hostname }${ formatPort(location) }${ location.path }`;

const formatPort = (location: LocationMetadata) => !!location.port ? `:${location.port}`: ''

export const RecordingHeader = withStyles(styles)(_RecordingHeader);

export interface RecordingHeaderProps extends WithStyles<typeof styles> {
    metadata: RecordingMetadata;
}