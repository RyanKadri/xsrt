import React from "react";
import { RecordingMetadata } from "../../../scraper/traverse/extract-metadata";
import { createStyles, withStyles, WithStyles } from "@material-ui/core";
import { fullUrl, shortUrl, formatDate } from "../utils/format-utils";

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

export const RecordingHeader = withStyles(styles)(_RecordingHeader);

export interface RecordingHeaderProps extends WithStyles<typeof styles> {
    metadata: RecordingMetadata;
}