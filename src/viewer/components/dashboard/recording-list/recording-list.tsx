import { createStyles, Table, TableBody, TableCell, TableHead, TableRow, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { RecordingOverview } from "../../../../scraper/types/types";
import { formatDate, formatDuration } from "../../utils/format-utils";

const styles = (_: Theme) => createStyles({
    preview: {
        maxWidth: 360,
        maxHeight: 240,
        cursor: "pointer"
    }
})

const _RecordingList = (props: RecordingListProps) => {
    const recordings = props.recordings.concat().sort((a, b) => b.metadata.startTime - a.metadata.startTime );
    return recordings.length === 0 
        ?   <Typography variant="body1">No recordings yet...</Typography>
        :   <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>User Agent</TableCell>
                        <TableCell>Preview</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{
                    recordings.map(recording => RecordingRow(recording, props))
                }</TableBody>
            </Table>;
}

const RecordingRow = (recording: RecordingOverview, props: RecordingListProps) => {
    const {_id, metadata, thumbnail } = recording;
    const { classes, onPreview } = props;
    return <TableRow key={_id}>
        <TableCell>
            <Link to={`/recordings/${_id}`}>
                { formatDate(metadata.startTime) }                
            </Link>
        </TableCell>
        <TableCell>
            { metadata.duration
                ? formatDuration(metadata.duration)
                : 'N/A'
            }
        </TableCell>
        <TableCell>
            { metadata.uaDetails 
                ? `${ metadata.uaDetails.browser.name } - ${ metadata.uaDetails.os.name }`
                : "Unknown" }
        </TableCell>
        <TableCell>
            { thumbnail 
                ? <img 
                    className={ classes.preview }
                    src={ `/screenshots/${thumbnail}` }
                    onClick={ () => onPreview(recording) } />
                : null } 
        </TableCell>
    </TableRow>
}

export interface RecordingListProps extends WithStyles<typeof styles> {
    recordings: RecordingOverview[];
    onPreview: (thumbnail: RecordingOverview) => void;
}

export const RecordingList = withStyles(styles)(_RecordingList)