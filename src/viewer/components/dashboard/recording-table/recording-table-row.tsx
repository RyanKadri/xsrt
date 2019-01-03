import { Checkbox, createStyles, TableCell, TableRow, WithStyles, withStyles } from "@material-ui/core";
import React from 'react';
import { Link } from "react-router-dom";
import { RecordingOverview } from "../../../../scraper/types/types";
import { formatDate, formatDuration } from "../../utils/format-utils";

const styles = createStyles({
    preview: {
        maxWidth: 360,
        maxHeight: 240,
        cursor: "pointer"
    },
})

const _RecordingRow = ({classes, onPreview, recording, selected, onToggle }: RecordingTableRowProps) => {
    const {_id, metadata, thumbnail } = recording;
    return <TableRow key={_id}>
        <TableCell>
            <Checkbox onChange={() => onToggle( recording )} checked={ selected } />
        </TableCell>
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

export const RecordingRow = withStyles(styles)(_RecordingRow);

export interface RecordingTableRowProps extends WithStyles<typeof styles> {
    recording: RecordingOverview;
    selected: boolean;
    onPreview: (thumbnail: RecordingOverview) => void;
    onToggle: (recording: RecordingOverview) => void;
}