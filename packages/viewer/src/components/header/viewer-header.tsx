import { createStyles, withStyles, WithStyles } from "@material-ui/core";
import { DocumentMetadata, formatDate, fullUrl, shortUrl } from "../../../../common/src";
import React from "react";

const styles = createStyles({
    header: {
        padding: 12,
        fontSize: "2em",
        color: "black",
        display: "flex",
        alignItems: "center"
    },
    date: {
        marginLeft: 16
    },
    url: {
        marginLeft: "auto",
        fontSize: "1.5rem"
    }
});

function _RecordingHeader({metadata, classes, startTime}: RecordingHeaderProps) {
    return (
        <header className={ classes.header }>
            <a target="_blank" href={ fullUrl(metadata.url) } className={classes.url}>{ shortUrl(metadata.url) }</a>
            <small className={ classes.date }>{ formatDate( startTime ) }</small>
        </header>
    );
}

export const RecordingHeader = withStyles(styles)(_RecordingHeader);

export interface RecordingHeaderProps extends WithStyles<typeof styles> {
    metadata: DocumentMetadata;
    startTime: number;
}
